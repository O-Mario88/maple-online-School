// Package db embeds the SQL migrations for the tables the Go service owns.
package db

import "embed"

// Migrations holds goose migrations, applied at startup.
//
//go:embed migrations/*.sql
var Migrations embed.FS
