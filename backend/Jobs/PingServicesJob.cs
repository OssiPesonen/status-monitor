using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using StatusMonitor.Models;
using StatusMonitor.Services.Cron;

namespace StatusMonitor.Jobs;

public class PingServicesJob(IServiceProvider serviceProvider, ILogger<PingServicesJob> logger)
    : ICronJob
{
    private static readonly HttpClient HttpClient = new();

    public async Task Run(CancellationToken stoppingToken)
    {
        logger.LogInformation("--- Starting PingBackgroundService");
        // Fetch all sites in db
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<StatusMonitorDb>();
        var sites = await db.Sites.ToListAsync(stoppingToken);

        try
        {
            var tasks = new List<Task>();
            foreach (var site in sites)
            {
                // Use the most recent status to determine when we need to ping agaion
                var interval = site.Interval;
                var status = await db.Statuses
                    .Where(s => s.SiteId == site.Id)
                    .OrderByDescending(x => x.Id)
                    .FirstOrDefaultAsync(stoppingToken);

                if (status != null)
                {
                    var nextPing = status.Time + TimeSpan.FromMinutes(interval);
                    if (DateTime.Compare(DateTime.Now, nextPing) > 0)
                    {
                        tasks.Add(ProcessUrlAsync(db, site, stoppingToken));
                    }
                }
                else
                {
                    // Initial ping
                    tasks.Add(ProcessUrlAsync(db, site, stoppingToken));
                }
            }

            // Make sure everything has completed before waiting
            if (tasks.Count > 0)
            {
                await Task.WhenAll(tasks);
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "--- An error occured while processing urls.");
        }
    }

    private async Task ProcessUrlAsync(StatusMonitorDb db, Site site, CancellationToken cancellationToken)
    {
        var timer = new Stopwatch();
        timer.Start();

        try
        {
            var response = site.HttpMethod switch
            {
                "POST" => await HttpClient.PostAsync(site.Address, null, cancellationToken),
                _ => await HttpClient.GetAsync(site.Address, cancellationToken)
            };

            timer.Stop();

            await RecordResponseStatus(db, site.Id, (int)response.StatusCode, timer.ElapsedMilliseconds,
                cancellationToken);
            logger.LogInformation("--- Processed URL: {Url} with status {StatusCode}", site.Address,
                response.StatusCode);
        }
        catch (Exception ex)
        {
            timer.Stop();
            // Record failure
            await RecordResponseStatus(db, site.Id, 500, timer.ElapsedMilliseconds, cancellationToken);
            logger.LogDebug(ex, "--- Error processing URL: {Url}", site.Address);
        }
    }

    private async Task RecordResponseStatus(StatusMonitorDb db, int siteId, int statusCode, long responseTime,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("--- Recording response status for {siteId}", siteId);

        // Todo: Support different protocols
        var status = new Status
        {
            SiteStatus = statusCode is >= 200 and < 300 ? SiteStatus.Up : SiteStatus.Down,
            SiteId = siteId,
            ResponseTime = responseTime,
            Time = DateTime.Now,
        };

        db.Statuses.Add(status);
        await db.SaveChangesAsync(cancellationToken);
    }
}