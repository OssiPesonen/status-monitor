using Microsoft.EntityFrameworkCore;

namespace StatusMonitor.Jobs;

using StatusMonitor.Services.Cron;

public class PurgeDataJob(IServiceProvider serviceProvider) : ICronJob
{
    public async Task Run(CancellationToken token = default)
    {
        using var scope = serviceProvider.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<PurgeDataJob>>();
        logger.LogInformation("Beginning data purge...");
        var db = scope.ServiceProvider.GetRequiredService<StatusMonitorDb>();
        
        var now = DateTime.UtcNow;
        var days = Environment.GetEnvironmentVariable("ASPNETCORE_DATA_RETENTION_DAYS") ?? "30";
        now = now.AddDays(-1 * int.Parse(days));
        logger.LogInformation("Purging data older than {now}", now.ToLongDateString());
        
        await db.Statuses.Where(s => s.Time < now).ExecuteDeleteAsync(token);
    }
}