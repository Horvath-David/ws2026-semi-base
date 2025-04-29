using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class WorkSession
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public WorkerRoles SessionType { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    public virtual ICollection<WorkSessionItem> WorkSessionItems { get; set; } = new List<WorkSessionItem>();
}
