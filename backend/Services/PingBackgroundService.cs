using System.Collections.Concurrent;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using StatusMonitor.Models;

namespace StatusMonitor.Services;

public class PingBackgroundService(IServiceProvider serviceProvider, ILogger<PingBackgroundService> logger)
    : BackgroundService
{
    private static readonly HttpClient HttpClient = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("--- Starting PingBackgroundService");
        while (!stoppingToken.IsCancellationRequested)
        {
            // Fetch all sites in db
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<StatusMonitorDb>();
            var sites = await db.Sites.ToListAsync(stoppingToken);

            try
            {
                var tasks = new List<Task>();
                foreach (var site in sites)
                {
                    // Fetch the most recent status update so we know if we need to ping it again
                    var interval = site.Interval;
                    var status = await db.Statuses
                        .Where(s => s.SiteId == site.Id)
                        .OrderByDescending(x => x.Id)
                        .FirstOrDefaultAsync(stoppingToken);

                    if (status == null) continue;

                    // Only ping the service if we've gone past the next ping time
                    var nextPing = status.Time + TimeSpan.FromMinutes(interval);
                    if (DateTime.Compare(DateTime.Now, nextPing) > 0)
                    {
                        tasks.Add(ProcessUrlAsync(db, site, stoppingToken));
                    }
                }

                // Make sure everything has completed before waiting
                if (tasks.Count > 0)
                {
                    await Task.WhenAll(tasks);
                }
                else
                {
                    logger.LogInformation("--- No pings to be run");
                }

                logger.LogInformation("--- All tasks completed. Running again in 1 minute.");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                logger.LogInformation("--- Operation canceled. Stopping background task.");
                break;
            }
            catch (Exception e)
            {
                logger.LogError(e, "--- An error occured while processing urls.");
            }
        }

        logger.LogInformation("--- Stopping PingBackgroundService");
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
            logger.LogError(ex, "--- Error processing URL: {Url}", site.Address);
        }
    }

    private async Task RecordResponseStatus(StatusMonitorDb db, int siteId, int statusCode, long responseTime,
        CancellationToken cancellationToken)
    {
        logger.LogInformation($"--- Recording response status for {siteId}");

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