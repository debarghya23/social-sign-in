using Microsoft.EntityFrameworkCore;
using SocialSignInAPI.Models;

namespace SocialSignInAPI.Data
{
    /// <summary>
    /// Represents the database context for the SignIn application.
    /// </summary>
    public class SignInDbContext : DbContext
    {
        public SignInDbContext(DbContextOptions<SignInDbContext> options) : base(options) { }

        /// <summary>
        /// Gets or sets the users in the system.
        /// </summary>
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<User>().Property(u => u.LoggedInAt).HasDefaultValueSql("GETDATE()");
        }
    }
}
