-- Family-staff conversations. Go owns msg_threads and msg_messages (migration 00008).

-- name: SharedSchool :one
-- A school where the learner studies and the staff member works (0 if none).
SELECT COALESCE(min(ls.institution_id), 0)::bigint
FROM institutions_institutionmembership ls
JOIN institutions_institutionmembership ss
  ON ss.institution_id = ls.institution_id AND ss.user_id = sqlc.arg(staff)::bigint AND ss.status = 'active'
 AND ss.role = ANY(sqlc.arg(staff_roles)::text[])
WHERE ls.user_id = sqlc.arg(student)::bigint AND ls.role = 'student' AND ls.status = 'active';

-- name: TeachesStudent :one
SELECT EXISTS (SELECT 1 FROM classes_class c
               JOIN classes_classenrollment e ON e.enrolled_class_id = c.id
               WHERE c.teacher_id = sqlc.arg(staff)::bigint AND e.student_id = sqlc.arg(student)::bigint AND e.status = 'active');

-- name: IsApprovedParent :one
SELECT EXISTS (SELECT 1 FROM parent_portal_parentstudentlink l
               JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
               JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
               WHERE pp.user_id = sqlc.arg(parent)::bigint AND sp.user_id = sqlc.arg(student)::bigint
                 AND l.consent_status = 'approved');

-- name: CreateThread :one
INSERT INTO msg_threads (school_id, student_id, staff_id, subject, created_by)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;

-- name: AddMessage :one
INSERT INTO msg_messages (thread_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, created_at;

-- name: TouchThread :exec
UPDATE msg_threads SET last_message_at = now() WHERE id = $1;

-- name: GetThread :one
SELECT t.id, t.school_id, t.student_id, su.full_name AS student_name, t.staff_id, st.full_name AS staff_name,
       t.subject, t.created_at, t.last_message_at
FROM msg_threads t
JOIN accounts_user su ON su.id = t.student_id
JOIN accounts_user st ON st.id = t.staff_id
WHERE t.id = $1;

-- name: ThreadsFor :many
-- Conversations the person takes part in (as the staff member or a confirmed
-- parent) or can read as a leader of the school. Most recent first.
SELECT t.id, t.school_id, t.student_id, su.full_name AS student_name, t.staff_id, st.full_name AS staff_name,
       t.subject, t.last_message_at,
       COALESCE(lm.body, '')::text AS last_body, COALESCE(la.full_name, '')::text AS last_author
FROM msg_threads t
JOIN accounts_user su ON su.id = t.student_id
JOIN accounts_user st ON st.id = t.staff_id
LEFT JOIN LATERAL (SELECT m.body, m.author_id FROM msg_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) lm ON true
LEFT JOIN accounts_user la ON la.id = lm.author_id
WHERE t.staff_id = sqlc.arg(viewer)::bigint
   OR t.school_id = ANY(sqlc.arg(leader_schools)::bigint[])
   OR EXISTS (SELECT 1 FROM parent_portal_parentstudentlink l
              JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
              JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
              WHERE pp.user_id = sqlc.arg(viewer)::bigint AND sp.user_id = t.student_id AND l.consent_status = 'approved')
ORDER BY t.last_message_at DESC, t.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountThreadsFor :one
SELECT count(*) FROM msg_threads t
WHERE t.staff_id = sqlc.arg(viewer)::bigint
   OR t.school_id = ANY(sqlc.arg(leader_schools)::bigint[])
   OR EXISTS (SELECT 1 FROM parent_portal_parentstudentlink l
              JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
              JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
              WHERE pp.user_id = sqlc.arg(viewer)::bigint AND sp.user_id = t.student_id AND l.consent_status = 'approved');

-- name: ThreadMessages :many
SELECT m.id, m.author_id, u.full_name AS author_name, m.body, m.created_at
FROM msg_messages m JOIN accounts_user u ON u.id = m.author_id
WHERE m.thread_id = $1
ORDER BY m.created_at, m.id;

-- name: MessageContacts :many
-- Staff a learner's family can write to: their teachers and their school's leaders.
SELECT DISTINCT u.id, u.full_name,
       CASE WHEN c.teacher_id IS NOT NULL THEN 'teacher' ELSE m.role END::text AS role
FROM accounts_user u
LEFT JOIN classes_class c ON c.teacher_id = u.id AND EXISTS (
    SELECT 1 FROM classes_classenrollment e WHERE e.enrolled_class_id = c.id AND e.student_id = sqlc.arg(student)::bigint AND e.status = 'active')
LEFT JOIN institutions_institutionmembership m ON m.user_id = u.id AND m.status = 'active' AND m.role = ANY(sqlc.arg(leader_roles)::text[])
  AND m.institution_id IN (SELECT institution_id FROM institutions_institutionmembership
                           WHERE user_id = sqlc.arg(student)::bigint AND role = 'student' AND status = 'active')
WHERE (c.id IS NOT NULL OR m.id IS NOT NULL) AND u.is_active
ORDER BY u.full_name;
