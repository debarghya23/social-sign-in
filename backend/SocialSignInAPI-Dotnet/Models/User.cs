using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialSignInAPI.Models
{
    /// <summary>
    /// Represents an authenticated user in the system.
    /// </summary>
    [Table("Users")]
    public class User
    {
        /// <summary>
        /// Gets or sets the unique identifier for the user.
        /// </summary>
        [Key]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the username of the user.
        /// </summary>
        [MaxLength(100)]
        public required string Username { get; set; }

        /// <summary>
        /// Gets or sets the email address of the user.
        /// </summary>
        [Required]
        [MaxLength(200)]
        public required string Email { get; set; }

        /// <summary>
        /// Gets or sets the provider used for login (Google, LinkedIn, GitHub).
        /// </summary>
        [Required]
        [MaxLength(50)]
        public required string Provider { get; set; }

        /// <summary>
        /// Gets or sets the provider's unique ID for the user.
        /// </summary>
        [Required]
        [MaxLength(100)]
        public required string ProviderUserId { get; set; }

        /// <summary>
        /// Gets or sets the timestamp when the user logged in.
        /// </summary>
        [Required]
        public DateTime LoggedInAt { get; set; }
    }
}
