namespace StatusMonitor.DTO;

public class RegisterUserDTO
{
    public required string Email { get; set; }
    
    public required string Password { get; set; }
    
    public required string DisplayName { get; set; }
}