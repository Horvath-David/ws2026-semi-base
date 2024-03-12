namespace AspAPI;

internal record WelcomeResponse {
    // [JsonPropertyName("welcome_message")]
    public string? Message { get; set; }
}