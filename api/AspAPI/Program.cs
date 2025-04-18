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
builder.Services.AddDbContext<SkillsContext>();

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

app.MapGet("/db-test", (SkillsContext db) =>
    db.ProgrammingLanguages
        .OrderBy(x => x.ReleaseDate)
);

app.MapPost("/validation-test", ([FromBody] JsonElement? body) => {

    var name = body!.Value.TryGetProperty("name", out var _nameProp)
        ? _nameProp.ValueKind == JsonValueKind.String ? _nameProp.GetString() : null
        : null;

    int? age = body!.Value.TryGetProperty("age", out var _ageProp)
        ? _ageProp.ValueKind == JsonValueKind.Number && _ageProp.TryGetInt32(out var _age) ? _age : null
        : null;

    if (name == null) return Results.Json("name is invalid");
    if (age == null) return Results.Json("age is invalid");

    return Results.Json(new {
        name,
        age,
        body
    });
});

app.Run();