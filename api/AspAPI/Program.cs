using System.Text.Json;
using System.Text.RegularExpressions;
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
builder.Services.AddDbContext<CompetitorContext>();

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

app.MapGet("/db-test", (CompetitorContext db) =>
    db.Customers
        .OrderBy(x => x.Discount)
);

app.MapPost("/api/orders/purchase", async (NewOrderBody body, CompetitorContext db) => {
    if (body.OrderNumber == null) {
        return Results.Json("orderNumber is invalid", statusCode: 400);
    }
    if (body.Quantity == null) {
        return Results.Json("quantity is invalid", statusCode: 400);
    }
    if (body.CustomerId == null) {
        return Results.Json("customerId is invalid", statusCode: 400);
    }
    if (body.ProductId == null) {
        return Results.Json("productId is invalid", statusCode: 400);
    }
    if (body.IsTakeaway == null) {
        return Results.Json("isTakeaway is invalid", statusCode: 400);
    }
    if (body.OrderDate == null) {
        return Results.Json("orderDate is invalid", statusCode: 400);
    }

    if (db.Orders.FirstOrDefault(x => x.Number == body.OrderNumber) != null) {
        return Results.Json("orderNumber is invalid", statusCode: 400);
    }

    var client = new HttpClient();
    ProductResponse? product = null;
    try {
        var res = await client.GetFromJsonAsync<ProductResponse>($"http://crm.skills.local/api/products/{body.ProductId}");
        if (res == null) {
            return Results.Json("productId is invalid", statusCode: 400);
        }
        product = res;
    } catch {
        return Results.Json("productId is invalid", statusCode: 400);
    }

    var order = new Order {
        Number = body.OrderNumber ?? 0,
        IsTakeaway = body.IsTakeaway ?? false,
        CustomerId = body.CustomerId ?? Guid.Empty,
        ProductId = body.ProductId ?? Guid.Empty,
        Quantity = body.Quantity ?? 0,
        OrderedAt = body.OrderDate ?? DateTime.UnixEpoch
    };

    var customer = db.Customers.FirstOrDefault((x) => x.Id == order.CustomerId);
    if (customer == null) {
        return Results.Json("customerId is invalid", statusCode: 400);
    }

    var totalPrice = product.Price * order.Quantity;
    var finalTotalPrice = totalPrice * (1 - customer.Discount);
    var discount = totalPrice - finalTotalPrice;

    var vat = order.IsTakeaway ? new decimal(0.05) : new decimal(0.27);
    var netPrice = finalTotalPrice / (1 + vat);

    order.TotalPrice = Math.Round(finalTotalPrice, 2);
    order.TotalDiscount = Math.Round(discount, 2);
    order.NetPrice = Math.Round(netPrice, 2);
    order.Vat = Math.Round(finalTotalPrice - netPrice, 2);

    db.Add(order);
    db.SaveChanges();

    return Results.Json(order.Id);
});

app.MapGet("/api/customers/search", (string? searchTerm, CompetitorContext db) => {
    if (searchTerm == null || searchTerm == "") {
        return Results.Json("searchTerm is invalid", statusCode: 400);
    }

    var results = db.Customers.Where(
        x => x.Id.ToString().Contains(searchTerm) ||
            (x.FirstName + " " + x.LastName).Contains(searchTerm) ||
            (x.Email != null && x.Email.Contains(searchTerm))
    ).Select(x => new {
        x.Id,
        x.FirstName,
        x.LastName,
        x.Email,
        x.Discount,
        OrdersCount = db.Orders.Count(order => order.CustomerId == x.Id)
    });
    return Results.Json(
        results
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
            // .Concat(results)
    );
});

app.MapPost("/api/orders", async (OrderFilters filters, CompetitorContext db) => {
    var customer = db.Customers.FirstOrDefault((x) => x.Id == filters.CustomerId);
    if (customer == null) {
        return Results.Json("customerId is invalid", statusCode: 400);
    }

    var query = db.Orders
        .Where(x => x.CustomerId == filters.CustomerId);

    if (filters.Number != null) {
        query = query.Where(x => x.Number == filters.Number);
    }

    if (filters.Page == null || filters.Page < 0) {
        return Results.Json("page is invalid", statusCode: 400);
    }

    if (filters.PageSize == null || filters.PageSize <= 0) {
        return Results.Json("pageSize is invalid", statusCode: 400);
    }

    var totalCount = query.Count();
    var totalPages = Math.Ceiling(new decimal(totalCount) / new decimal(filters.PageSize ?? 1d));

    var client = new HttpClient();

    var items = query.Skip(filters.Page * filters.PageSize ?? 0).Take(filters.PageSize ?? 0).OrderByDescending(x => x.OrderedAt).ToList();

    var products = new Dictionary<Guid, ProductResponse>();
    var completeItems = new List<CompleteOrder>();
    foreach (var order in items) {
        ProductResponse? product = null;
        try {
            product = await client.GetFromJsonAsync<ProductResponse>($"http://crm.skills.local/api/products/{order.ProductId}");
        } catch { }

        completeItems.Add(new CompleteOrder(
            Id: order.Id,
            Number: order.Number,
            ProductName: product?.Name ?? "",
            IsTakeaway: order.IsTakeaway,
            OrderedAt: order.OrderedAt,
            Quantity: order.Quantity,
            TotalPrice: order.TotalPrice
        ));
    }

    return Results.Json(new {
        page = filters.Page,
        pageSize = filters.PageSize,
        totalCount,
        hasPreviousPage = (filters.Page ?? 0) > 0,
        hasNextPage = totalPages > (filters.Page ?? 0) + 1,
        items = completeItems
    });
});

app.MapGet("/api/orders/{orderId}", async (string? orderId, CompetitorContext db) => {
    if (orderId == "null" || orderId == "") {
        return Results.Json("orderId is invalid", statusCode: 400);
    }

    var orderGuid = Guid.Empty;
    if (!Guid.TryParse(orderId, out orderGuid)) {
        return Results.Json("orderId is invalid", statusCode: 400);
    }

    var order = db.Orders.FirstOrDefault((x) => x.Id == orderGuid);
    if (order == null) {
        return Results.Json("orderId is invalid", statusCode: 400);
    }

    var client = new HttpClient();
    ProductResponse? product = null;
    try {
        product = await client.GetFromJsonAsync<ProductResponse>($"http://crm.skills.local/api/products/{order.ProductId}");
    } catch { }

    var orderResponse = new {
        order.Id,
        ProductName = product?.Name ?? "",
        order.Number,
        order.Quantity,
        order.IsTakeaway,
        order.NetPrice,
        order.Vat,
        order.TotalPrice,
        order.TotalDiscount,
        order.OrderedAt,
    };

    return Results.Json(orderResponse);
});

app.Run();