using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace AspAPI.Models;

public partial class DbContext : Microsoft.EntityFrameworkCore.DbContext {
    public DbContext() {
    }

    public DbContext(DbContextOptions<DbContext> options)
        : base(options) {
    }

    public virtual DbSet<WorkSession> WorkSessions { get; set; }

    public virtual DbSet<WorkSessionItem> WorkSessionItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("host=mysql;port=3306;username=competitor2;password=skills9BadBad;database=competitor2-session3", Microsoft.EntityFrameworkCore.ServerVersion.Parse("9.3.0-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<WorkSession>(entity => {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id)
                .UseCollation("ascii_general_ci")
                .HasCharSet("ascii");
            entity.Property(e => e.FinishedAt).HasMaxLength(6);
            entity.Property(e => e.StartedAt).HasMaxLength(6);
            entity.Property(e => e.UserId)
                .UseCollation("ascii_general_ci")
                .HasCharSet("ascii");
        });

        modelBuilder.Entity<WorkSessionItem>(entity => {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.WorkSessionId, "IX_WorkSessionItems_WorkSessionId");

            entity.Property(e => e.Id)
                .UseCollation("ascii_general_ci")
                .HasCharSet("ascii");
            entity.Property(e => e.FinishedAt).HasMaxLength(6);
            entity.Property(e => e.OrderId)
                .UseCollation("ascii_general_ci")
                .HasCharSet("ascii");
            entity.Property(e => e.StartedAt).HasMaxLength(6);
            entity.Property(e => e.WorkSessionId)
                .UseCollation("ascii_general_ci")
                .HasCharSet("ascii");

            entity.HasOne(d => d.WorkSession).WithMany(p => p.WorkSessionItems).HasForeignKey(d => d.WorkSessionId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
