using System.Text.Json.Serialization;

namespace AspAPI.Models;

public partial class TestEntry {
    [JsonPropertyName("id")]
    public string ID { get; set; } = "";

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("colorHex")]
    public string? ColorHex { get; set; } = "";

    [JsonPropertyName("isSomething")]
    public bool IsSomething { get; set; }
}