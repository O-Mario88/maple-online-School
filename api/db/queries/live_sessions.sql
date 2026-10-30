-- Live sessions, their reminders, and missed-session recovery. Go owns writes
-- to these tables. A session belongs to a lesson and is seen by whoever can
-- see that lesson (see lessons.sql).

-- name: CountVisibleLiveSessions :one
SELECT count(*)
FROM live_sessions_livesession s
JOIN lessons_lesson l ON l.id = s.lesson_id
JOIN classes_class c ON c.id = l.parent_class_id
WHERE (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))))
  AND (sqlc.narg(status)::text IS NULL OR s.status = sqlc.narg(status));

-- name: ListVisibleLiveSessions :many
SELECT s.id, s.meeting_link, s.replay_url, s.provider, s.provider_event_id, s.scheduled_start,
       s.duration_minutes, s.capacity, s.enrolled_count, s.status, s.artifact_sync_status, s.lesson_id,
       l.title, l.parent_class_id, c.institution_id, c.teacher_id, u.full_name AS host_name,
       COALESCE(NULLIF(isub.custom_name, ''), cs.name, '')::text AS subject_name
FROM live_sessions_livesession s
JOIN lessons_lesson l ON l.id = s.lesson_id
JOIN classes_class c ON c.id = l.parent_class_id
JOIN accounts_user u ON u.id = c.teacher_id
LEFT JOIN institutions_institutionsubject isub ON isub.id = c.institution_subject_id
LEFT JOIN curriculum_subject cs ON cs.id = isub.subject_id
WHERE (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))))
  AND (sqlc.narg(status)::text IS NULL OR s.status = sqlc.narg(status))
ORDER BY s.scheduled_start NULLS LAST, s.id
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetVisibleLiveSession :one
SELECT s.id, s.meeting_link, s.replay_url, s.provider, s.provider_event_id, s.scheduled_start,
       s.duration_minutes, s.capacity, s.enrolled_count, s.status, s.artifact_sync_status, s.lesson_id,
       l.title, l.parent_class_id, c.institution_id, c.teacher_id, u.full_name AS host_name,
       COALESCE(NULLIF(isub.custom_name, ''), cs.name, '')::text AS subject_name
FROM live_sessions_livesession s
JOIN lessons_lesson l ON l.id = s.lesson_id
JOIN classes_class c ON c.id = l.parent_class_id
JOIN accounts_user u ON u.id = c.teacher_id
LEFT JOIN institutions_institutionsubject isub ON isub.id = c.institution_subject_id
LEFT JOIN curriculum_subject cs ON cs.id = isub.subject_id
WHERE s.id = sqlc.arg(id)
  AND (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))));

-- name: CreateLiveSession :one
INSERT INTO live_sessions_livesession (meeting_link, provider, scheduled_start, duration_minutes, capacity,
                                       enrolled_count, status, artifact_sync_status, lesson_id)
VALUES (sqlc.arg(meeting_link), sqlc.arg(provider), sqlc.narg(scheduled_start), sqlc.arg(duration_minutes),
        sqlc.arg(capacity), 0, 'scheduled', 'none', sqlc.arg(lesson_id))
ON CONFLICT (lesson_id) DO NOTHING
RETURNING id;

-- name: UpdateLiveSession :exec
UPDATE live_sessions_livesession
SET meeting_link = sqlc.arg(meeting_link), replay_url = sqlc.narg(replay_url), provider = sqlc.arg(provider),
    scheduled_start = sqlc.narg(scheduled_start), duration_minutes = sqlc.arg(duration_minutes),
    capacity = sqlc.arg(capacity), status = sqlc.arg(status)::text,
    artifact_sync_status = sqlc.arg(artifact_sync_status)::text
WHERE id = sqlc.arg(id);

-- ---- reminders (staff of the session's class) ------------------------------------

-- name: ListSessionReminders :many
SELECT id, send_at, status, session_id FROM live_sessions_sessionreminder
WHERE session_id = $1 ORDER BY send_at, id;

-- name: CreateSessionReminder :one
INSERT INTO live_sessions_sessionreminder (send_at, status, session_id)
VALUES ($1, 'pending', $2)
RETURNING id, send_at, status, session_id;

-- name: GetSessionReminder :one
SELECT id, send_at, status, session_id FROM live_sessions_sessionreminder WHERE id = $1;

-- name: DeleteSessionReminder :exec
DELETE FROM live_sessions_sessionreminder WHERE id = $1 AND status = 'pending';

-- ---- missed-session recovery ------------------------------------------------------

-- name: ListRecoveries :many
-- Staff of the class see everyone's; learners see only their own.
SELECT r.id, r.summary, r.recording_url, r.recovery_status, r.submitted_at, r.created_at,
       r.session_id, r.student_id, u.full_name AS student_name
FROM live_sessions_missedsessionrecovery r
JOIN accounts_user u ON u.id = r.student_id
WHERE r.session_id = sqlc.arg(session_id)
  AND (sqlc.arg(all_students)::boolean OR r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
ORDER BY u.full_name, r.id;

-- name: GetRecovery :one
SELECT r.id, r.summary, r.recording_url, r.recovery_status, r.submitted_at, r.created_at,
       r.session_id, r.student_id, u.full_name AS student_name
FROM live_sessions_missedsessionrecovery r
JOIN accounts_user u ON u.id = r.student_id
WHERE r.id = $1;

-- name: CreateRecovery :one
INSERT INTO live_sessions_missedsessionrecovery (summary, recording_url, recovery_status, created_at, session_id, student_id)
VALUES (sqlc.arg(summary), sqlc.narg(recording_url), 'pending', now(), sqlc.arg(session_id), sqlc.arg(student_id))
ON CONFLICT (session_id, student_id) DO NOTHING
RETURNING id;

-- name: UpdateRecovery :exec
UPDATE live_sessions_missedsessionrecovery
SET summary = sqlc.arg(summary), recording_url = sqlc.narg(recording_url),
    recovery_status = sqlc.arg(recovery_status)::text,
    submitted_at = CASE WHEN sqlc.arg(recovery_status)::text = 'submitted' AND submitted_at IS NULL THEN now()
                        ELSE submitted_at END
WHERE id = sqlc.arg(id);

-- name: RecoveryAssignments :many
SELECT id, title, file_type, file_url, recovery_id FROM live_sessions_recoveryassignment
WHERE recovery_id = ANY(sqlc.arg(recovery_ids)::bigint[]) ORDER BY id;
