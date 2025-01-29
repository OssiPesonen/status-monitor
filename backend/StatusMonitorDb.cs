using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StatusMonitor.Models;

namespace StatusMonitor;

public class StatusMonitorDb(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Site> Sites { get; set; } = null!;
    
    public DbSet<Status> Statuses { get; set; } = null!;
}