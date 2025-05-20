namespace AspAPI;

public static class GlobalData {
    public static UserMock[] users = [
        new UserMock(
            Info:  new UserInfo([], Guid.NewGuid().ToString(), "one"),
            Password: "one",
            PartnerId: Guid.NewGuid().ToString()
        ),
        new UserMock(
            Info:  new UserInfo([], Guid.NewGuid().ToString(), "two"),
            Password: "two",
            PartnerId: Guid.NewGuid().ToString()
        ),
        new UserMock(
            Info:  new UserInfo([], Guid.NewGuid().ToString(), "three"),
            Password: "three",
            PartnerId: Guid.NewGuid().ToString()
        ),
        new UserMock(
            Info:  new UserInfo(["admin", "Transporter"], Guid.NewGuid().ToString(), "admin"),
            Password: "admin",
            PartnerId: Guid.NewGuid().ToString()
        ),
        new UserMock(
            Info:  new UserInfo(["Gatherer"], Guid.NewGuid().ToString(), "john_doe"),
            Password: "password",
            PartnerId: Guid.NewGuid().ToString()
        ),
    ];

    public static BaseProduct[] baseProducts = [
        new BaseProduct {
            Name = "Croissant au Beurre",
            Price = 1.40m
        },
        new BaseProduct {
            Name = "Pain au Chocolat",
            Price = 1.50m
        },
        new BaseProduct {
            Name = "Chausson aux Pommes",
            Price = 1.80m
        },
        new BaseProduct {
            Name = "Pain aux Raisins",
            Price = 1.60m
        },
        new BaseProduct {
            Name = "Brioche à Tête",
            Price = 1.30m
        },
        new BaseProduct {
            Name = "Croissant aux Amandes",
            Price = 2.00m
        },
        new BaseProduct {
            Name = "Baguette Traditionnelle",
            Price = 1.20m
        },
        new BaseProduct {
            Name = "Ficelle",
            Price = 0.90m
        },
        new BaseProduct {
            Name = "Pain de Campagne",
            Price = 3.00m
        },
        new BaseProduct {
            Name = "Éclair au Chocolat",
            Price = 3.20m
        },
    ];

    public static Dictionary<string, CrmProduct[]> partnerProducts = [];

    static GlobalData() {
        foreach (var partner in users) {
            partnerProducts.Add(
                partner.PartnerId,
                [.. baseProducts.Select(x => new CrmProduct(
                    Id: Guid.NewGuid().ToString(),
                    Name: x.Name,
                    Price: x.Price,
                    AvailableQuantity: (int)Random.Shared.NextInt64(0, 20),
                    StockQuantity: (int)Random.Shared.NextInt64(20, 30),
                    AlertQuantity: (int)Random.Shared.NextInt64(5, 10)
                ))]
            );
        }
    }
}