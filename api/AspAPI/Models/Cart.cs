using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class Cart
{
    public Guid Id { get; set; }

    public Guid CreatedByUserId { get; set; }

    public int Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
