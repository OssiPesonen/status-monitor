namespace StatusMonitor.Models;

public class Status
{
    public int Id { get; set; }
    
    /// <summary>
    /// Status (UP / DOWN)
    /// </summary>
    public required SiteStatus SiteStatus { get; set; }

    /// <summary>
    /// Site / service identifier
    /// </summary>
    public required int SiteId { get; set; }
    
    /// <summary>
    /// Timestamp for when request was done
    /// </summary>
    public DateTime Time { get; set; }
    
    /// <summary>
    /// Response time in milliseconds
    /// </summary>
    public long ResponseTime { get; set;  }
}