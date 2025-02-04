namespace StatusMonitor.DTO;

public class RegistrationRequest
{
    public required string Email { get; set; }
    
    public required string Password { get; set; }
    
    public required string DisplayName { get; set; }
}