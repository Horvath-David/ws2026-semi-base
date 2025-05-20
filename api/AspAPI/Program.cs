using System.Text.Json;
using AspAPI;
using AspAPI.Models;
using Microsoft.AspNetCore.Mvc;

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

// ##### IDP MOCK ENDPOINTS #####

app.MapPost("/api/authentication/login", ([FromBody] JsonElement? body) => {
    if (!body.HasValue) return Results.BadRequest();

    string? username = body.Value!.TryGetProperty("username", out var _usernameProperty)
        ? _usernameProperty.ValueKind == JsonValueKind.String ? _usernameProperty.GetString() : null
        : null;
    string? password = body.Value!.TryGetProperty("password", out var _passwordProperty)
        ? _passwordProperty.ValueKind == JsonValueKind.String ? _passwordProperty.GetString() : null
        : null;

    var user = GlobalData.users.Where(x => x.Info.Username == username && x.Password == password).FirstOrDefault();
    if (user == null) return Results.Unauthorized();

    var header = Utils.Base64UrlEncode(JsonSerializer.Serialize(new {
        alg = "HS256",
        typ = "JWT"
    }));
    var payload = Utils.Base64UrlEncode(JsonSerializer.Serialize(new {
        iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        sub = user.Info.Id,
        name = user.Info.Username,
        roles = user.Info.Roles
    }));

    var message = $"{header}.{payload}";
    var signature = Utils.CreateSignature(message, "skills");

    var jwt = $"{message}.{signature}";
    return Results.Ok(jwt);
});

app.MapGet("/api/authentication/info", ([FromHeader] string Authorization = "") => {
    if (!Authorization.StartsWith("Bearer ")) return Results.Unauthorized();
    var token = Authorization.Split(" ")[1];


    var tokenParts = token.Split(".");
    if (tokenParts.Length != 3) return Results.Unauthorized();
    string header = tokenParts[0], payload = tokenParts[1], signature = tokenParts[2];

    var message = $"{header}.{payload}";
    var correctSignature = Utils.CreateSignature(message, "skills");

    if (signature != correctSignature) return Results.Unauthorized();
    var payloadObj = JsonSerializer.Deserialize<JwtPayload>(Utils.Base64UrlDecode(payload));

    return Results.Ok(new UserInfo(
        Id: payloadObj?.Sub ?? "",
        Username: payloadObj?.Name ?? "",
        Roles: payloadObj?.Roles ?? []
    ));
});

app.MapGet("/api/users/{userId}", (string userId) => {
    var user = GlobalData.users.Where(x => x.Info.Id == userId).FirstOrDefault();
    if (user == null) return Results.NotFound();

    return Results.Ok(new CrmUserDetails(user.Info.Id, user.PartnerId));
});

app.MapGet("/api/products/partner", (string partnerId) => {
    var products = GlobalData.partnerProducts.GetValueOrDefault(partnerId);

    if (products == null) return Results.NotFound();

    return Results.Ok(products);
});

// ##### ENDPOINTS & UTILS #####

app.MapGet("/", () => new WelcomeResponse {
    Message = welcomeMessage
});

app.MapGet("/db-test", async (DbContext db, HttpContext context) => {
    var hc = new HttpClient();
    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", $"{context.Request.Headers.Authorization.FirstOrDefault()}");
        user = await hc.GetFromJsonAsync<UserInfo?>($"{app.Urls.FirstOrDefault()?.Replace("0.0.0.0", "localhost")}/api/authentication/info");
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
        user = await hc.GetFromJsonAsync<UserInfo?>($"{app.Urls.FirstOrDefault()?.Replace("0.0.0.0", "localhost")}/api/authentication/info");
    } catch (Exception e) {
        Console.WriteLine(app.Urls.FirstOrDefault("null") ?? "null", e);
        return Results.Unauthorized();
    }
    var userDetails = await hc.GetFromJsonAsync<CrmUserDetails>($"{app.Urls.FirstOrDefault()?.Replace("0.0.0.0", "localhost")}/api/users/{user?.Id}");
    var crmProducts = await hc.GetFromJsonAsync<CrmProduct[]>($"{app.Urls.FirstOrDefault()?.Replace("0.0.0.0", "localhost")}/api/products/partner?partnerId={userDetails?.PartnerId}");

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
        return Results.NotFound($"Item {itemId} not found in cart");
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

app.MapDelete("/api/carts/items/{itemId}", async (DbContext db, string itemId, [FromHeader] string Authorization = "") => {
    var hc = new HttpClient();

    UserInfo? user;
    try {
        hc.DefaultRequestHeaders.Add("Authorization", Authorization);
        user = await hc.GetFromJsonAsync<UserInfo?>("http://idp.skills.lan/api/authentication/info");
    } catch {
        return Results.Unauthorized();
    }

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
        return Results.NotFound($"Item {itemId} not found in cart");
    }

    db.CartItems.Remove(cartItem);
    db.SaveChanges();

    List<CartModelItem> completeItems = [];

    foreach (var item in cart.CartItems) {
        var productDetails = await hc.GetFromJsonAsync<CrmProduct>($"http://crm.skills.lan/api/products/{item.ProductId}");
        completeItems.Add(new CartModelItem(item.Id.ToString(), productDetails?.Name ?? "", item.Quantity, productDetails?.Price ?? 0, (productDetails?.Price ?? 0) * item.Quantity));
    }

    return Results.Ok(new CartModel(cart.Id.ToString(), cart.CreatedAt.ToString("s").Split(".").First(), completeItems.Sum(x => x.TotalPrice), [.. completeItems]));
});

app.Run();