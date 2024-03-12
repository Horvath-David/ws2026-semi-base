using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class ProgrammingLanguage {
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateOnly? ReleaseDate { get; set; }

    public string? Description { get; set; }

    public string? Homepage { get; set; }
}