// Package db embeds the SQL migrations for the tables the Go service owns.
package db

import "embed"

// Migrations holds goose migrations, applied at startup.
//
//go:embed migrations/*.sql
var Migrations embed.FS

// LegacySchema creates the tables Maple first made with Django. It is applied
// once, to an empty database, before the migrations.
//
//go:embed baseline/legacy_schema.sql
var LegacySchema string
