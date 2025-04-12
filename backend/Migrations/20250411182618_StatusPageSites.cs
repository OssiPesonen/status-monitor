using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StatusMonitor.Migrations
{
    /// <inheritdoc />
    public partial class StatusPageSites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StatusPageSites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StatusPageId = table.Column<int>(type: "INTEGER", nullable: false),
                    SiteId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusPageSites", x => x.Id);
                    
                    table.ForeignKey(
                        name: "FK_StatusPageSites_SiteId",
                        column: x => x.SiteId,
                        principalTable: "Sites",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    
                    table.ForeignKey(
                        name: "FK_StatusPageSites_StatusPageId",
                        column: x => x.StatusPageId,
                        principalTable: "StatusPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StatusPageSites");
        }
    }
}
