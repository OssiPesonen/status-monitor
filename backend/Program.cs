using StatusMonitor;
using StatusMonitor.Jobs;
using StatusMonitor.Services;

const string allowLocalhostOrigin = "_localHostOrigins";

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Sites") ?? "Data Source=Sites.db";

builder.Services.AddSqlite<StatusMonitorDb>(connectionString);
builder.Services.AddHostedService<PingBackgroundService>();
builder.Services.AddCronJob<PurgeDataJob>("0 0 * * *");

builder.Services.AddIdentityServices(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowLocalhostOrigin, policy =>
    {
        policy.WithOrigins("http://localhost:3000");
        policy.WithHeaders("*");
        policy.AllowCredentials();
        policy.WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    });
});

var app = builder.Build();

// app.UseHttpsRedirection();

app.UseCors(allowLocalhostOrigin);

app.UseAuthentication();
app.UseAuthorization();

Router.AddRoutes(app);

app.Run();