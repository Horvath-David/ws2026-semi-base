using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class Customer
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? Email { get; set; }

    public decimal Discount { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
