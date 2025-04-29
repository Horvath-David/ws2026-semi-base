namespace AspAPI;

internal record WelcomeResponse {
    // [JsonPropertyName("welcome_message")]
    public string? Message { get; set; }
}

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

public enum WorkerRoles {
    Gatherer,
    Transporter
}

public record WhOrderItem(
    string ProductName,
    int Quantity
);

public record CrmPartner(
    string Id,
    string Name
);