using AspAPI;
using AspAPI.Models;

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
builder.Services.AddDbContext<SkillsContext>();

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

app.MapGet("/db-test", (SkillsContext db) =>
    db.ProgrammingLanguages
        .OrderBy(x => x.ReleaseDate)
);

app.MapGet("/api/customers/search", (string? searchTerm, int page = 0, int perPage = 25) => {
    if (searchTerm == null || searchTerm == "") {
        return Results.BadRequest("searchTerm is invalid");
    }

    var total = GlobalData.customers.Where(
        x => x.Id.ToString().Contains(searchTerm) ||
            (x.FirstName + " " + x.LastName).Contains(searchTerm) ||
            (x.Email != null && x.Email.Contains(searchTerm))
    ).Count();

    var results = GlobalData.customers.Where(
        x => x.Id.ToString().Contains(searchTerm) ||
            (x.FirstName + " " + x.LastName).Contains(searchTerm) ||
            (x.Email != null && x.Email.Contains(searchTerm))
    ).Skip(perPage * page).Take(perPage).Select(x => new {
        x.Id,
        x.FirstName,
        x.LastName,
        x.Email,
        x.Discount,
        x.OrdersCount
    });

    return Results.Json(new {
        total,
        perPage,
        results,
    });
});

app.MapPost("api/customers/{id}/increment-order", (Guid id) => {
    var customer = GlobalData.customers.FirstOrDefault(x => x.Id == id);
    if (customer == null) return Results.BadRequest("invalid ID");

    customer.OrdersCount += 1;

    return Results.Ok(customer);
});

app.Run();