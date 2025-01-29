using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StatusMonitor.Migrations
{
    /// <inheritdoc />
    public partial class SiteIntervalColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Interval",
                table: "Sites",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Interval",
                table: "Sites");
        }
    }
}
