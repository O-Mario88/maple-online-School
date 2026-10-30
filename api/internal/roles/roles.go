// Package roles names the school membership roles and what each group may do.
// Keep in sync with mobile/src/lib/roles.ts.
package roles

// Leaders run a school: they manage classes, enrolment and every register.
var Leaders = []string{"headteacher", "deputy", "dos", "exam_officer", "ict_admin"}

// Teachers teach classes and mark work.
var Teachers = []string{"class_teacher", "subject_teacher", "librarian", "counselor"}

// Staff is everyone who works at a school (leaders, teachers and the registrar).
var Staff = append(append(append([]string{}, Leaders...), Teachers...), "registrar")

// Finance runs a school's fees: billing, recording payments and the ledger.
var Finance = []string{"headteacher", "deputy", "registrar"}
