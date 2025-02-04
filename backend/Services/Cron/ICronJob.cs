namespace StatusMonitor.Services.Cron;

public interface ICronJob
{
    Task Run(CancellationToken token = default);
}
