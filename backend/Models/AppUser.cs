using Microsoft.AspNetCore.Identity;

namespace StatusMonitor.Models;

public class AppUser : IdentityUser
{
    public string DisplayName { get; set; }   
}