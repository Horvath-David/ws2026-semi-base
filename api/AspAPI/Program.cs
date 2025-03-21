using AspAPI;
using AspAPI.Models;

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

app.Run();