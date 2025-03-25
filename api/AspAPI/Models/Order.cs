using System;
using System.Collections.Generic;

namespace AspAPI.Models;

public partial class Order
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public Guid ProductId { get; set; }

    public int Number { get; set; }

    public int Quantity { get; set; }

    public bool IsTakeaway { get; set; }

    public decimal NetPrice { get; set; }

    public decimal Vat { get; set; }

    public decimal TotalPrice { get; set; }

    public decimal TotalDiscount { get; set; }

    public DateTime OrderedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;
}
