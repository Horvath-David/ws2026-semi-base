namespace AspAPI;

internal record WelcomeResponse {
    // [JsonPropertyName("welcome_message")]
    public string? Message { get; set; }
}

internal record NewOrderBody(
    int? OrderNumber,
    bool? IsTakeaway,
    Guid? CustomerId,
    Guid? ProductId,
    int? Quantity,
    DateTime? OrderDate
);

internal record ProductResponse(
    Guid Id,
    string Name,
    string Code,
    string Description,
    decimal Price
);

internal record OrderFilters(
    Guid CustomerId,
    int? Page,
    int? PageSize,
    int? Number = null
);

internal record CompleteOrder(
    Guid Id,
    int Number,
    string ProductName,
    bool IsTakeaway,
    DateTime OrderedAt,
    int Quantity,
    decimal TotalPrice
);