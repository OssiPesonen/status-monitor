using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StatusMonitor.Migrations
{
    /// <inheritdoc />
    public partial class AddNameToSite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                table: "Sites",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Sites",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Sites");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Sites",
                newName: "Url");
        }
    }
}
