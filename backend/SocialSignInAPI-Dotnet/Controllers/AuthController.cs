using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SocialSignInAPI.Data;
using SocialSignInAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SocialSignInAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Redirects the user to the selected provider's login page.
        /// </summary>
        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLogin(string provider)
        {
            if (provider.ToLower() == "google") provider = "Google";
            if (provider.ToLower() == "github") provider = "GitHub";
            if (provider.ToLower() == "linkedin") provider = "LinkedIn";

            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth");
            Console.WriteLine($"Redirect url:{redirectUrl}");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };

            // Add the state parameter to properties for CSRF protection
            var state = Guid.NewGuid().ToString();  // Generate a unique state
            properties.Items["state"] = state;

            Console.WriteLine($"State: {properties.Items["state"]}");

            return Challenge(properties, provider);
        }

        /// <summary>
        /// Handles the callback after external login.
        /// </summary>
        [HttpGet("external-callback")]
        public async Task<IActionResult> ExternalLoginCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!authenticateResult.Succeeded)
            {
                return BadRequest("External authentication failed.");
            }

            var state = authenticateResult.Properties.Items["state"];
            Console.WriteLine($"State from callback: {state}");

            var claims = authenticateResult.Principal.Claims.ToDictionary(c => c.Type, c => c.Value);

            var email = claims.TryGetValue("email", out var emailValue) ? emailValue : null;
            var provider = claims["http://schemas.microsoft.com/identity/claims/identityprovider"];
            var providerUserId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is missing from external provider.");
            }

            var username = claims.ContainsKey("urn:github:login")
                ? claims["urn:github:login"]
                : claims.ContainsKey("urn:linkedin:name")
                    ? claims["urn:linkedin:name"]
                    : email.Split('@')[0];

            using (var scope = HttpContext.RequestServices.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<SignInDbContext>();
                var user = dbContext.Users.FirstOrDefault(u => u.Email == email);

                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        Provider = provider,
                        ProviderUserId = providerUserId,
                        Username = username,
                        LoggedInAt = DateTime.UtcNow
                    };
                    dbContext.Users.Add(user);
                }
                else
                {
                    user.Username = username;
                    user.LoggedInAt = DateTime.UtcNow;
                }

                await dbContext.SaveChangesAsync();
            }

            // Generate JWT token
            var token = GenerateJwtToken(email, username);

            // Return token as part of the response
            return Ok(new
            {
                Message = "Authentication successful!",
                Token = token,
                Username = username
            });
        }

        /// <summary>
        /// Logs out the user.
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { Message = "Logged out successfully!" });
        }

        /// <summary>
        /// Generates a JWT token for the authenticated user.
        /// </summary>
        /// <param name="email">User's email address.</param>
        /// <param name="username">User's username.</param>
        /// <returns>A signed JWT token string.</returns>
        private string GenerateJwtToken(string email, string username)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(ClaimTypes.Role, "User")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}