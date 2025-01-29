using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StatusMonitor.Migrations
{
    /// <inheritdoc />
    public partial class AdjustStatusTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StatusCode",
                table: "Statuses",
                newName: "SiteStatus");

            migrationBuilder.AddColumn<long>(
                name: "ResponseTime",
                table: "Statuses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponseTime",
                table: "Statuses");

            migrationBuilder.RenameColumn(
                name: "SiteStatus",
                table: "Statuses",
                newName: "StatusCode");
        }
    }
}
