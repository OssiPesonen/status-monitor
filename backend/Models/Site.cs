using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace StatusMonitor.Models;

public enum SiteStatus
{
    Down = 0,
    Up = 1
}

public class Site
{
    private string? _httpMethod;
    
    public int Id { get; set; }

    /// <summary>
    /// Name (title) of monitored system / service
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Address for service / system
    /// </summary>
    [MaxLength(255)]
    public required string Address { get; set; }

    /// <summary>
    /// Update interval in minutes. Defaults to 5 minutes.
    /// </summary>
    public required int Interval { get; set; } = 5;

    /// <summary>
    /// 
    /// </summary>
    [MaxLength(10)]
    public string? HttpMethod
    {
        get => _httpMethod;
        set
        {
            string[] allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
            var v = value?.ToUpper();
            if (value != null && allowedMethods.Contains(v))
            {
                _httpMethod = value;
            }
            else
            {
                _httpMethod = null;
            }
        } 
    }

    /// <summary>
    /// Site status (UP / DOWN). Defaults to 5 minutes.
    /// </summary>
    public SiteStatus Status { get; set; } = SiteStatus.Up;

    /// <summary>
    /// List of recent status updates that can be attached to Site data
    /// </summary>
    public virtual List<Status> Statuses { get; set; } = null!;
}