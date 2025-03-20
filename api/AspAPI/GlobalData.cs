using AspAPI.Models;

public static class GlobalData {
    private static readonly string[] firstNames = ["Elza", "Elliot", "Jeremy", "Dexter", "Kim", "Roland", "Robin", "David", "Derek", "Matt", "Karl", "Colton"];
    private static readonly string[] lastNames = ["Mitchell", "Lynch", "Senger", "Strosin", "Mills", "Kutch", "Schmidt", "Blanda", "Zboncak", "Wilderman"];

    public static readonly TestEntry[] entries = [.. Enumerable.Range(1, 200).Select(i => new TestEntry {
        ID = Guid.NewGuid().ToString(),
        Name = $"{Random.Shared.GetItems(firstNames, 1)[0]} {Random.Shared.GetItems(lastNames, 1)[0]}",
        ColorHex = $"#{Random.Shared.Next(16):X}{Random.Shared.Next(16):X}{Random.Shared.Next(16):X}",
        IsSomething = Random.Shared.Next(2) == 1
    })];
}