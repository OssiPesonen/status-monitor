namespace StatusMonitor.DTO;

public class UpdateUserRequest
{
    public required string DisplayName { get; set; }

    public string? Password { get; set; } = null;

    public string? NewPassword { get; set; } = null;
}