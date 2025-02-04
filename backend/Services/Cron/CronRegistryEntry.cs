namespace StatusMonitor.Services.Cron;

using NCrontab;

public sealed record CronRegistryEntry(Type Type, CrontabSchedule CrontabSchedule);