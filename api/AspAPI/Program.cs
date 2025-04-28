using System.Text.Json;
using System.Threading.Tasks;
using AspAPI;
using AspAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

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
    return Results.Json(user);


    // return db.CartItems
    //     .OrderBy(x => x.Quantity);
});

app.MapGet("/api/products", async ([FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }
    var userDetails = await hc.GetFromJsonAsync<CrmUserDetails>($"http://crm.skills.lan/api/users/{user?.Id}");
    var crmProducts = await hc.GetFromJsonAsync<CrmProduct[]>($"http://crm.skills.lan/api/products/partner?partnerId={userDetails?.PartnerId}");


    return Results.Ok(crmProducts?.Select(product => new {
        product.Id,
        product.Name,
        product.AvailableQuantity,
        product.StockQuantity,
        product.Price,
        warningType = product.StockQuantity == 0 ? "OutOfStock" : product.AlertQuantity <= product.StockQuantity ? "None" : "LowStock"
    }));
});

app.MapGet("/api/orders", async ([FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }
    var userDetails = await hc.GetFromJsonAsync<CrmUserDetails>($"http://crm.skills.lan/api/users/{user?.Id}");
    var crmProducts = await hc.GetFromJsonAsync<CrmProduct[]>($"http://crm.skills.lan/api/products/partner?partnerId={userDetails?.PartnerId}");
    var erpOrders = await hc.GetFromJsonAsync<ErpOrder[]>($"http://erp.skills.lan/api/orders/partner?partnerId={userDetails?.PartnerId}");

    List<Order> completeOrders = [];

    foreach (var order in erpOrders ?? []) {
        List<OrderItem> completeItems = [];

        foreach (var item in order.Items) {
            var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
            completeItems.Add(new OrderItem(productDetails?.Name ?? "", item.Quantity, item.Price, item.Price * item.Quantity));
        }

        completeOrders.Add(new Order(order.Id, order.OrderedAt, order.Status, completeItems.Sum(x => x.TotalPrice), [.. completeItems]));
    }
    return Results.Ok(completeOrders);
});

app.MapGet("/api/carts", async (DbContext db, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }
    // var userDetails = await hc.GetFromJsonAsync<CrmUserDetails>($"http://crm.skills.lan/api/users/{user?.Id}");

    var cart = db.Carts.FirstOrDefault(x => x.CreatedByUserId.Equals(Guid.Parse(user!.Id)));

    if (cart == null) {
        cart = new Cart {
            CartItems = [],
            CreatedAt = DateTime.Parse(DateTime.UtcNow.ToString()),
            CreatedByUserId = Guid.Parse(user!.Id),
            Id = Guid.NewGuid(),
        };
        db.Carts.Add(cart);
        db.SaveChanges();
    }

    List<CartModelItem> completeItems = [];

    foreach (var item in cart.CartItems) {
        var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
        completeItems.Add(new CartModelItem(item.Id.ToString(), productDetails?.Name ?? "", item.Quantity, productDetails?.Price ?? 0, (productDetails?.Price ?? 0) * item.Quantity));
    }

    return Results.Ok(new CartModel(cart.Id.ToString(), cart.CreatedAt.ToString("s").Split(".").First(), completeItems.Sum(x => x.TotalPrice), [.. completeItems]));
});

app.MapPost("/api/carts/items", async (DbContext db, [FromBody] JsonElement? body, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();

    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    if (!body.HasValue) return Results.BadRequest();

    string? productId = body.Value!.TryGetProperty("productId", out var _productIdProperty)
        ? _productIdProperty.ValueKind == JsonValueKind.String ? _productIdProperty.GetString() : null
        : null;

    int? quantity = body.Value!.TryGetProperty("quantity", out var _quantityProperty)
        ? _quantityProperty.ValueKind == JsonValueKind.Number ?
            _quantityProperty.TryGetInt32(out var _quantity)
                ? _quantity
                : null : null
        : null;

    if (productId == null || quantity == null) return Results.BadRequest();

    CrmProduct? product;
    try {
        product = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{productId}");
    } catch {
        return Results.BadRequest($"Product {productId} has insufficient quantity");
    }

    if (product?.AvailableQuantity < quantity) return Results.BadRequest($"Product {productId} has insufficient quantity");

    var cart = db.Carts.FirstOrDefault(x => x.CreatedByUserId.Equals(Guid.Parse(user!.Id)));
    if (cart == null) {
        cart = new Cart {
            CartItems = [],
            CreatedAt = DateTime.Parse(DateTime.UtcNow.ToString()),
            CreatedByUserId = Guid.Parse(user!.Id),
            Id = Guid.NewGuid(),
        };
        db.Carts.Add(cart);
        db.SaveChanges();
    }

    var cartItem = db.CartItems.FirstOrDefault(x => x.CartId == cart.Id && x.ProductId.ToString() == productId);
    if (cartItem == null) {
        cartItem = new CartItem {
            Id = Guid.NewGuid(),
            CartId = cart.Id,
            ProductId = Guid.Parse(productId),
            Quantity = 0,
        };
        db.CartItems.Add(cartItem);
        db.SaveChanges();
    }
    cartItem.Quantity += quantity ?? 0;
    db.SaveChanges();

    List<CartModelItem> completeItems = [];

    foreach (var item in cart.CartItems) {
        var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
        completeItems.Add(new CartModelItem(item.Id.ToString(), productDetails?.Name ?? "", item.Quantity, productDetails?.Price ?? 0, (productDetails?.Price ?? 0) * item.Quantity));
    }

    return Results.Ok(new CartModel(cart.Id.ToString(), cart.CreatedAt.ToString("s").Split(".").First(), completeItems.Sum(x => x.TotalPrice), [.. completeItems]));
});

app.MapPatch("/api/carts/items/{itemId}", async (DbContext db, string itemId, [FromBody] JsonElement? body, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();

    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

    if (!body.HasValue) return Results.BadRequest();

    int? newQuantity = body.Value!.TryGetProperty("newQuantity", out var _newQuantityProperty)
        ? _newQuantityProperty.ValueKind == JsonValueKind.Number ?
            _newQuantityProperty.TryGetInt32(out var _newQuantity)
                ? _newQuantity
                : null : null
        : null;

    if (newQuantity == null) return Results.BadRequest();

    var cart = db.Carts.FirstOrDefault(x => x.CreatedByUserId.Equals(Guid.Parse(user!.Id)));
    if (cart == null) {
        cart = new Cart {
            CartItems = [],
            CreatedAt = DateTime.Parse(DateTime.UtcNow.ToString()),
            CreatedByUserId = Guid.Parse(user!.Id),
            Id = Guid.NewGuid(),
        };
        db.Carts.Add(cart);
        db.SaveChanges();
    }

    var cartItem = db.CartItems.FirstOrDefault(x => x.CartId == cart.Id && x.Id.ToString() == itemId);
    if (cartItem == null) {
        return Results.BadRequest($"Item {itemId} not found in cart");
    }

    CrmProduct? product;
    try {
        product = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{cartItem.ProductId}");
    } catch {
        return Results.BadRequest($"Product {cartItem.ProductId} has insufficient quantity");
    }

    if (product?.AvailableQuantity < newQuantity) return Results.BadRequest($"Product {cartItem.ProductId} has insufficient quantity");

    cartItem.Quantity = newQuantity ?? 0;
    db.SaveChanges();

    List<CartModelItem> completeItems = [];

    foreach (var item in cart.CartItems) {
        var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
        completeItems.Add(new CartModelItem(item.Id.ToString(), productDetails?.Name ?? "", item.Quantity, productDetails?.Price ?? 0, (productDetails?.Price ?? 0) * item.Quantity));
    }

    return Results.Ok(new CartModel(cart.Id.ToString(), cart.CreatedAt.ToString("s").Split(".").First(), completeItems.Sum(x => x.TotalPrice), [.. completeItems]));
});

app.Run();