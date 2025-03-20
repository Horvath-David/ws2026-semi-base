using System.Reflection;
using System.Text.Json.Serialization;
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

var app = builder.Build();
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// ##### GLOBALS #####

var db = new SkillsContext();
const string welcomeMessage = "AspAPI - WorldSkills 2026 BaseProject v0.0.1";

// ##### ENDPOINTS & UTILS #####

app.MapGet("/", () => new WelcomeResponse {
    Message = welcomeMessage
});

app.MapGet("/db-test", () =>
    db.ProgrammingLanguages
        .OrderBy(x => x.ReleaseDate)
);

app.MapGet("/entries", (string? sort, int? page, int? itemsPerPage) => {
    IEnumerable<TestEntry> query = [.. GlobalData.entries];

    if ((sort ?? "").StartsWith('-')) {
        var propertyName = sort?[1..];
        query = query.OrderByDescending(x => propertyName switch {
            "id" => x.ID,
            "name" => x.Name,
            "colorHex" => x.ColorHex,
            "isSomething" => (x.IsSomething ? 1 : 0).ToString(),
            _ => x.ID
        });
    }
    if (sort != "" && !(sort ?? "").StartsWith('-')) {
        var propertyName = sort;
        query = query.OrderBy(x => propertyName switch {
            "id" => x.ID,
            "name" => x.Name,
            "colorHex" => x.ColorHex,
            "isSomething" => (x.IsSomething ? 1 : 0).ToString(),
            _ => x.ID
        });
    }

    var total = query.Count();

    if (itemsPerPage == null || itemsPerPage <= 0 || itemsPerPage > 999) {
        itemsPerPage = 25;
    }
    if (page == null || page <= 0) {
        page = 0;
    }

    query = query.Skip((page * itemsPerPage) ?? 0).Take(itemsPerPage ?? 25);

    return Results.Json(
        new {
            total,
            page,
            itemsPerPage,
            results = query
        }
    );
});

app.Run();