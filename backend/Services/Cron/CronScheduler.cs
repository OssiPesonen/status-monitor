namespace StatusMonitor.Services.Cron;

public sealed class CronScheduler : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IReadOnlyCollection<CronRegistryEntry> _cronJobs;

    public CronScheduler(
        IServiceProvider serviceProvider,
        IEnumerable<CronRegistryEntry> cronJobs)
    {
        // Use the container
        _serviceProvider = serviceProvider;
        _cronJobs = cronJobs.ToList();
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // CRON has a precision of 1 minute so create a timer with less than that to hit every schedule
        using var tickTimer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        var runMap = new Dictionary<DateTime, List<Type>>();

        while (await tickTimer.WaitForNextTickAsync(stoppingToken))
        {
            var now = UtcNowMinutePrecision();
            // Run jobs that are in the map
            RunActiveJobs(runMap, now, stoppingToken);
            runMap = GetJobRuns();
        }
    }

    private void RunActiveJobs(IReadOnlyDictionary<DateTime, List<Type>> runMap, DateTime now,
        CancellationToken stoppingToken)
    {
        if (!runMap.TryGetValue(now, out var currentRuns))
        {
            return;
        }

        foreach (var run in currentRuns)
        {
            var job = (ICronJob)_serviceProvider.GetRequiredService(run);
            job.Run(stoppingToken);
        }
    }

    private Dictionary<DateTime, List<Type>> GetJobRuns()
    {
        var runMap = new Dictionary<DateTime, List<Type>>();
        
        foreach (var cronJob in _cronJobs)
        {
            var utcNow = DateTime.UtcNow;
            var runDates = cronJob.CrontabSchedule.GetNextOccurrences(utcNow, utcNow.AddMinutes(1));
            if (runDates is not null)
            {
                AddJobRuns(runMap, runDates, cronJob);
            }
        }

        return runMap;
    }

    private static void AddJobRuns(IDictionary<DateTime, List<Type>> runMap, IEnumerable<DateTime> runDates,
        CronRegistryEntry cronJob)
    {
        foreach (var runDate in runDates)
        {
            if (runMap.TryGetValue(runDate, out var value))
            {
                value.Add(cronJob.Type);
            }
            else
            {
                runMap[runDate] = new List<Type> { cronJob.Type };
            }
        }
    }

    private static DateTime UtcNowMinutePrecision()
    {
        var now = DateTime.UtcNow;
        return new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0);
    }
}