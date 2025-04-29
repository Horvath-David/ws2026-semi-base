using AspAPI;
using AspAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Extensions;

// ##### SERVER SETUP #####

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAllOrigins",
        builder => {
            builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
        }));
builder.Services.AddDbContext<DbContext>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// ##### GLOBALS #####

const string welcomeMessage = "AspAPI - WorldSkills 2026 BaseProject v0.0.1";

// ##### ENDPOINTS & UTILS #####

app.MapGet("/", () => new WelcomeResponse {
    Message = welcomeMessage
});

app.MapGet("/db-test", async (DbContext db, HttpContext context) => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", $"{context.Request.Headers.Authorization.FirstOrDefault()}");
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    return Results.Ok(db.WorkSessionItems);
});

static async Task<IResult?> StopWorkSession(WorkSession session, DbContext db, HttpClient hc) {
    var unfinishedItems = db.WorkSessionItems.Where(x => x.WorkSessionId.Equals(session.Id) && x.FinishedAt == null);
    foreach (var item in unfinishedItems) {
        item.FinishedAt = DateTime.UtcNow;

        var revertedStatus = session.SessionType == WorkerRoles.Gatherer ? "Started" : "Gathered";
        await hc.PatchAsJsonAsync($"http://erp.skills.lan/api/orders/{item.OrderId}/status", new { status = revertedStatus });
    }

    session.FinishedAt = DateTime.UtcNow;
    db.SaveChanges();

    return null;
}

app.MapPost("/api/work-sessions/start", async (DbContext db, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    var session = db.WorkSessions.FirstOrDefault(x => x.FinishedAt == null);

    if (session != null) {
        await StopWorkSession(session, db, hc);
    }

    session = new WorkSession {
        Id = Guid.NewGuid(),
        UserId = Guid.Parse(user?.Id ?? ""),
        StartedAt = DateTime.UtcNow,
        FinishedAt = null,
        SessionType = (user?.Roles.Contains("Gatherer") ?? false) ? WorkerRoles.Gatherer : (user?.Roles.Contains("Transporter") ?? false) ? WorkerRoles.Transporter : 0
    };
    db.WorkSessions.Add(session);
    db.SaveChanges();

    return Results.Ok(new {
        session.Id,
        session.StartedAt,
        SessionType = session.SessionType.GetDisplayName()
    });
});

app.MapGet("/api/work-sessions/{sessionId}/items/next", async (DbContext db, string sessionId, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    var session = db.WorkSessions.FirstOrDefault(x => x.UserId.ToString() == user!.Id && x.FinishedAt == null);
    if (session == null) {
        return Results.NotFound("No active work session found");
    }
    if (session.Id.ToString() != sessionId) {
        return Results.UnprocessableEntity("The work session ID does not match the current work session");
    }

    var sessionItem = db.WorkSessionItems.FirstOrDefault(x => x.WorkSessionId.Equals(session.Id) && x.FinishedAt == null);
    if (sessionItem != null) {
        List<WhOrderItem> _completeItems = [];

        var erpOrder = await hc.GetFromJsonAsync<ErpOrder>($"http://erp.skills.lan/api/orders/{sessionItem.OrderId}");

        foreach (var item in erpOrder?.Items ?? []) {
            var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
            _completeItems.Add(new WhOrderItem(productDetails?.Name ?? "", item.Quantity));
        }

        var _partner = await hc.GetFromJsonAsync<CrmPartner>($"http://crm.skills.lan/api/partners/{erpOrder?.PartnerId}");

        return Results.Ok(new {
            sessionItem.StartedAt,
            sessionItem.OrderId,
            partnerName = _partner?.Name,
            orderItems = _completeItems
        });
    }

    var erpOrders = await hc.GetFromJsonAsync<ErpOrder[]>($"http://erp.skills.lan/api/orders/open");

    ErpOrder? chosenOrder = null;
    if (session.SessionType == WorkerRoles.Gatherer) {
        chosenOrder = erpOrders?
            .Where(x => x.Status == "Started")
            .OrderByDescending(x => x.Priority)
            .OrderBy(x => x.OrderedAt)
            .FirstOrDefault();
        if (chosenOrder == null) {
            chosenOrder = erpOrders?
                .Where(x => x.Status == "Created")
                .OrderByDescending(x => x.Priority)
                .OrderBy(x => x.OrderedAt)
                .FirstOrDefault();
        }
    }
    if (session.SessionType == WorkerRoles.Transporter) {
        chosenOrder = erpOrders?
            .Where(x => x.Status == "Gathered")
            .OrderByDescending(x => x.Priority)
            .OrderBy(x => x.OrderedAt)
            .FirstOrDefault();
    }

    if (chosenOrder == null) {
        return Results.NoContent();
    }

    sessionItem = new WorkSessionItem {
        Id = Guid.NewGuid(),
        WorkSessionId = session.Id,
        StartedAt = DateTime.UtcNow,
        OrderId = Guid.Parse(chosenOrder.Id),
        FinishedAt = null
    };
    db.WorkSessionItems.Add(sessionItem);
    db.SaveChanges();

    var nextStatus = session.SessionType == WorkerRoles.Gatherer ? "Gathering" : "Delivering";
    await hc.PatchAsJsonAsync($"http://erp.skills.lan/api/orders/{chosenOrder.Id}/status", new { status = nextStatus });

    List<WhOrderItem> completeItems = [];

    foreach (var item in chosenOrder.Items) {
        var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
        completeItems.Add(new WhOrderItem(productDetails?.Name ?? "", item.Quantity));
    }

    var partner = await hc.GetFromJsonAsync<CrmPartner>($"http://crm.skills.lan/api/partners/{chosenOrder.PartnerId}");

    return Results.Ok(new {
        sessionItem.StartedAt,
        sessionItem.OrderId,
        partnerName = partner?.Name,
        orderItems = completeItems
    });
});

app.MapPost("/api/work-sessions/{sessionId}/items/done", async (DbContext db, string sessionId, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    var session = db.WorkSessions.FirstOrDefault(x => x.UserId.ToString() == user!.Id && x.FinishedAt == null);
    if (session == null) {
        return Results.NotFound("No active work session found");
    }
    if (session.Id.ToString() != sessionId) {
        return Results.UnprocessableEntity("The work session ID does not match the current work session");
    }

    var sessionItem = db.WorkSessionItems.FirstOrDefault(x => x.WorkSessionId.Equals(session.Id) && x.FinishedAt == null);
    if (sessionItem == null) {
        return Results.NoContent();
    }

    sessionItem.FinishedAt = DateTime.UtcNow;
    db.SaveChanges();

    var nextStatus = session.SessionType == WorkerRoles.Gatherer ? "Gathered" : "Delivered";
    await hc.PatchAsJsonAsync($"http://erp.skills.lan/api/orders/{sessionItem.OrderId}/status", new { status = nextStatus });

    return Results.NoContent();
});

app.MapPost("/api/work-sessions/{sessionId}/stop", async (DbContext db, string sessionId, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    var session = db.WorkSessions.FirstOrDefault(x => x.UserId.ToString() == user!.Id && x.FinishedAt == null);
    if (session == null) {
        return Results.NotFound("No active work session found");
    }
    if (session.Id.ToString() != sessionId) {
        return Results.UnprocessableEntity("The work session ID does not match the current work session");
    }

    var result = await StopWorkSession(session, db, hc);
    if (result != null) {
        return result;
    }

    return Results.NoContent();
});

app.Run();