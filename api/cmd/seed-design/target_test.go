package main

import "testing"

func TestCheckTarget(t *testing.T) {
	cases := []struct {
		name, url, appEnv string
		ok                bool
	}{
		{"the local design database", "postgres://localhost/maple_design", "", true},
		{"a local address with a port and user", "postgres://me@127.0.0.1:5432/maple_design?sslmode=disable", "development", true},
		{"IPv6 loopback", "postgres://[::1]/maple_design", "", true},
		{"a Unix socket", "postgres:///maple_design?host=/tmp", "", true},
		{"never in production", "postgres://localhost/maple_design", "production", false},
		{"never a remote server", "postgres://db.maple.school/maple_design", "", false},
		{"never a remote server named in the query", "postgres:///maple_design?host=db.maple.school", "", false},
		{"never the everyday dev database", "postgres://localhost/maple_dev", "", false},
		{"never a database without a name", "postgres://localhost/", "", false},
		{"never something that isn't a Postgres address", "mysql://localhost/maple_design", "", false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			_, err := checkTarget(c.url, c.appEnv)
			if (err == nil) != c.ok {
				t.Fatalf("checkTarget(%q, %q) error = %v, want ok = %v", c.url, c.appEnv, err, c.ok)
			}
		})
	}
}

func TestCheckTargetNamesTheDatabase(t *testing.T) {
	name, err := checkTarget("postgres://localhost:5432/maple_design?sslmode=disable", "")
	if err != nil || name != "maple_design" {
		t.Fatalf("got %q, %v; want maple_design", name, err)
	}
}
