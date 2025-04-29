using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class WorkSessionItem
{
    public Guid Id { get; set; }

    public Guid WorkSessionId { get; set; }

    public Guid OrderId { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    public virtual WorkSession WorkSession { get; set; } = null!;
}
