using AspAPI.Models;

namespace AspAPI;

public static class GlobalData {
    private static string[] firstNames = ["Martin", "Francis", "John", "Elizabeth", "Carl", "Peter", "Matthew", "Annabelle", "Jack", "Joe", "Tanner"];
    private static string[] lastNames = ["Doe", "Parker", "Lindsley", "Lindgren", "Collins", "Smith"];

    public static Customer[] customers = [.. Enumerable.Range(1, 50).Select(_ => {
        var firstName = Random.Shared.GetItems(firstNames, 1)[0];
        var lastName = Random.Shared.GetItems(lastNames, 1)[0];
        return new Customer {
            Id = Guid.NewGuid(),
            Discount = Math.Round(new decimal(Random.Shared.NextDouble() / 5d), 2),
            FirstName = firstName,
            LastName = lastName,
            Email = $"{firstName.ToLower()}.{lastName.ToLower()}{Random.Shared.Next(10,100)}@example.com",
        };
    })];
}