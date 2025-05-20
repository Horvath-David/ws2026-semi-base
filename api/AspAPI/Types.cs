using System.Text.Json.Serialization;

namespace AspAPI;

internal record WelcomeResponse {
    // [JsonPropertyName("welcome_message")]
    public string? Message { get; set; }
}

// Mock models

public record UserMock(
    UserInfo Info,
    string Password,
    string PartnerId
);

public record JwtPayload {
    [JsonPropertyName("iat")] public int Iat { get; set; }
    [JsonPropertyName("sub")] public string Sub { get; set; } = "";
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("roles")] public string[] Roles { get; set; } = [];
}

public record BaseProduct {
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

// Normal models

public record UserInfo(
    string[] Roles,
    string Id = "",
    string Username = ""
);

public record CrmUserDetails(
    string Id,
    string PartnerId
);

public record CrmProduct(
    string Id,
    string Name,
    decimal Price,
    int AvailableQuantity,
    int StockQuantity,
    int AlertQuantity
);

public record ErpOrder(
    string Id,
    string PartnerId,
    string OrderedByUserId,
    string OrderedAt,
    string Status,
    string? WorkerUserId,
    decimal Priority,
    ErdOrderItem[] Items
);

public record OrderItem(
    string ProductName,
    int Quantity,
    decimal Price,
    decimal TotalPrice
);

public record Order(
    string Id,
    string OrderedAt,
    string Status,
    decimal TotalPrice,
    OrderItem[] Items
);

public record ErdOrderItem(
    string Id,
    string ProductId,
    int Quantity,
    decimal Price
);

public record CartModel(
    string Id,
    string CreatedAt,
    decimal TotalPrice,
    CartModelItem[] Items
);

public record CartModelItem(
    string Id,
    string ProductName,
    int Quantity,
    decimal Price,
    decimal TotalPrice
);