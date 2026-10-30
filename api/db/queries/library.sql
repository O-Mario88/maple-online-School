-- The library (playbook section 5): one store for notes, books, videos,
-- past papers and links. Go owns writes to these tables.
--
-- Who sees an item:
--   * its uploader, always;
--   * leaders of the owning school, always;
--   * Maple administrators, for platform-wide items (to moderate them);
--   * everyone else, once published: platform-wide items, their schools'
--     items, and items shared with a class they teach, lead or attend.

-- name: MemberSchoolIDs :many
SELECT DISTINCT institution_id
FROM institutions_institutionmembership
WHERE user_id = $1 AND status = 'active';

-- name: ViewerClassIDs :many
-- Classes the viewer teaches, leads (through their school) or attends
-- (themselves or an approved child).
SELECT c.id FROM classes_class c
WHERE c.teacher_id = sqlc.arg(viewer_id)
   OR c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
   OR EXISTS (SELECT 1 FROM classes_classenrollment e
              WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]));

-- name: CountLibraryItems :one
SELECT count(*)
FROM resources_contentitem i
WHERE (i.uploaded_by_id = sqlc.arg(viewer_id)
       OR i.owner_institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (sqlc.arg(is_admin)::boolean AND i.visibility_scope = 'global')
       OR (i.publication_status = 'published' AND (
             i.visibility_scope = 'global'
             OR (i.visibility_scope = 'institution' AND i.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
             OR (i.visibility_scope = 'class' AND EXISTS (
                   SELECT 1 FROM resources_contentvisibilityrule r
                   WHERE r.content_item_id = i.id AND r.target_class_id = ANY(sqlc.arg(class_ids)::bigint[]))))))
  AND i.archived_at IS NULL
  AND (sqlc.narg(search)::text IS NULL OR i.title ILIKE sqlc.narg(search) OR i.description ILIKE sqlc.narg(search))
  AND (sqlc.narg(content_type)::text IS NULL OR i.content_type = sqlc.narg(content_type))
  AND (sqlc.narg(subject_id)::bigint IS NULL OR i.subject_id = sqlc.narg(subject_id))
  AND (sqlc.narg(topic_id)::bigint IS NULL OR i.topic_id = sqlc.narg(topic_id))
  AND (sqlc.narg(class_level_id)::bigint IS NULL OR i.class_level_id = sqlc.narg(class_level_id))
  AND (sqlc.narg(status)::text IS NULL OR i.publication_status = sqlc.narg(status))
  AND (NOT sqlc.arg(mine_only)::boolean OR i.uploaded_by_id = sqlc.arg(viewer_id));

-- name: ListLibraryItems :many
SELECT i.id, i.title, i.description, i.content_type, i.owner_type, i.visibility_scope, i.publication_status,
       i.moderation_status, i.rejection_reason, i.file, i.external_url, i.duration_seconds, i.language,
       i.is_featured, i.created_at, i.updated_at, i.published_at, i.class_level_id, i.owner_institution_id,
       i.subject_id, i.topic_id, i.uploaded_by_id, u.full_name AS uploader_name,
       COALESCE(s.name, '')::text AS subject_name, COALESCE(t.name, '')::text AS topic_name
FROM resources_contentitem i
JOIN accounts_user u ON u.id = i.uploaded_by_id
LEFT JOIN curriculum_subject s ON s.id = i.subject_id
LEFT JOIN curriculum_topic t ON t.id = i.topic_id
WHERE (i.uploaded_by_id = sqlc.arg(viewer_id)
       OR i.owner_institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (sqlc.arg(is_admin)::boolean AND i.visibility_scope = 'global')
       OR (i.publication_status = 'published' AND (
             i.visibility_scope = 'global'
             OR (i.visibility_scope = 'institution' AND i.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
             OR (i.visibility_scope = 'class' AND EXISTS (
                   SELECT 1 FROM resources_contentvisibilityrule r
                   WHERE r.content_item_id = i.id AND r.target_class_id = ANY(sqlc.arg(class_ids)::bigint[]))))))
  AND i.archived_at IS NULL
  AND (sqlc.narg(search)::text IS NULL OR i.title ILIKE sqlc.narg(search) OR i.description ILIKE sqlc.narg(search))
  AND (sqlc.narg(content_type)::text IS NULL OR i.content_type = sqlc.narg(content_type))
  AND (sqlc.narg(subject_id)::bigint IS NULL OR i.subject_id = sqlc.narg(subject_id))
  AND (sqlc.narg(topic_id)::bigint IS NULL OR i.topic_id = sqlc.narg(topic_id))
  AND (sqlc.narg(class_level_id)::bigint IS NULL OR i.class_level_id = sqlc.narg(class_level_id))
  AND (sqlc.narg(status)::text IS NULL OR i.publication_status = sqlc.narg(status))
  AND (NOT sqlc.arg(mine_only)::boolean OR i.uploaded_by_id = sqlc.arg(viewer_id))
ORDER BY i.is_featured DESC, i.published_at DESC NULLS LAST, i.created_at DESC, i.id
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetLibraryItem :one
SELECT i.id, i.title, i.description, i.content_type, i.owner_type, i.visibility_scope, i.publication_status,
       i.moderation_status, i.rejection_reason, i.file, i.external_url, i.duration_seconds, i.language,
       i.is_featured, i.created_at, i.updated_at, i.published_at, i.class_level_id, i.owner_institution_id,
       i.subject_id, i.topic_id, i.uploaded_by_id, u.full_name AS uploader_name,
       COALESCE(s.name, '')::text AS subject_name, COALESCE(t.name, '')::text AS topic_name
FROM resources_contentitem i
JOIN accounts_user u ON u.id = i.uploaded_by_id
LEFT JOIN curriculum_subject s ON s.id = i.subject_id
LEFT JOIN curriculum_topic t ON t.id = i.topic_id
WHERE i.id = sqlc.arg(id) AND i.archived_at IS NULL
  AND (i.uploaded_by_id = sqlc.arg(viewer_id)
       OR i.owner_institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (sqlc.arg(is_admin)::boolean AND i.visibility_scope = 'global')
       OR (i.publication_status = 'published' AND (
             i.visibility_scope = 'global'
             OR (i.visibility_scope = 'institution' AND i.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
             OR (i.visibility_scope = 'class' AND EXISTS (
                   SELECT 1 FROM resources_contentvisibilityrule r
                   WHERE r.content_item_id = i.id AND r.target_class_id = ANY(sqlc.arg(class_ids)::bigint[]))))));

-- name: CreateLibraryItem :one
INSERT INTO resources_contentitem (
    id, title, description, content_type, owner_type, school_level, visibility_scope, publication_status,
    moderation_status, rejection_reason, external_url, mime_type, vimeo_video_id, vimeo_upload_status, language,
    version, is_featured, created_at, updated_at, published_at, class_level_id, owner_institution_id,
    subject_id, topic_id, uploaded_by_id)
VALUES (
    gen_random_uuid(), sqlc.arg(title), sqlc.arg(description), sqlc.arg(content_type), sqlc.arg(owner_type), '',
    sqlc.arg(visibility_scope), sqlc.arg(publication_status)::text, sqlc.arg(moderation_status), '',
    sqlc.arg(external_url), '', '', 'none', sqlc.arg(language), 1, false, now(), now(),
    CASE WHEN sqlc.arg(publication_status)::text = 'published' THEN now() END,
    sqlc.narg(class_level_id), sqlc.narg(owner_institution_id), sqlc.narg(subject_id), sqlc.narg(topic_id),
    sqlc.arg(uploaded_by_id))
RETURNING id;

-- name: UpdateLibraryItem :exec
UPDATE resources_contentitem
SET title = sqlc.arg(title), description = sqlc.arg(description), content_type = sqlc.arg(content_type),
    owner_type = sqlc.arg(owner_type), visibility_scope = sqlc.arg(visibility_scope),
    publication_status = sqlc.arg(publication_status)::text, moderation_status = sqlc.arg(moderation_status),
    rejection_reason = sqlc.arg(rejection_reason), external_url = sqlc.arg(external_url),
    language = sqlc.arg(language), class_level_id = sqlc.narg(class_level_id),
    owner_institution_id = sqlc.narg(owner_institution_id), subject_id = sqlc.narg(subject_id),
    topic_id = sqlc.narg(topic_id), version = version + 1, updated_at = now(),
    published_at = COALESCE(published_at, CASE WHEN sqlc.arg(publication_status)::text = 'published' THEN now() END)
WHERE id = sqlc.arg(id);

-- name: ArchiveLibraryItem :exec
UPDATE resources_contentitem SET archived_at = now(), publication_status = 'archived', updated_at = now()
WHERE id = $1;

-- name: LogLibraryChange :exec
INSERT INTO resources_contentauditlog (id, action, old_value, new_value, notes, timestamp, content_item_id, performed_by_id)
VALUES (gen_random_uuid(), sqlc.arg(action), sqlc.narg(old_value), sqlc.narg(new_value), sqlc.arg(notes), now(),
        sqlc.arg(content_item_id), sqlc.arg(performed_by_id));

-- ---- progress (playbook: "Continue Reading/Watching") ---------------------------

-- name: SaveProgress :one
-- One row per student per item. Completion never goes backwards, and an
-- item counts as finished at 95%.
INSERT INTO resources_contentengagement (
    id, view_count, active_time_seconds, completion_percentage, last_position, is_completed,
    first_accessed, last_accessed, content_item_id, student_id, completed_at, status)
VALUES (
    gen_random_uuid(), 1, sqlc.arg(active_seconds), sqlc.arg(completion), sqlc.arg(position),
    sqlc.arg(completion)::numeric >= 95, now(), now(), sqlc.arg(item_id), sqlc.arg(student_id),
    CASE WHEN sqlc.arg(completion)::numeric >= 95 THEN now() END,
    CASE WHEN sqlc.arg(completion)::numeric >= 95 THEN 'completed' WHEN sqlc.arg(completion)::numeric > 0 THEN 'in_progress' ELSE 'started' END)
ON CONFLICT (student_id, content_item_id) DO UPDATE SET
    view_count = resources_contentengagement.view_count + CASE WHEN sqlc.arg(new_visit)::boolean THEN 1 ELSE 0 END,
    active_time_seconds = resources_contentengagement.active_time_seconds + EXCLUDED.active_time_seconds,
    completion_percentage = GREATEST(resources_contentengagement.completion_percentage, EXCLUDED.completion_percentage),
    last_position = EXCLUDED.last_position,
    last_accessed = now(),
    is_completed = resources_contentengagement.is_completed OR EXCLUDED.is_completed,
    completed_at = COALESCE(resources_contentengagement.completed_at, EXCLUDED.completed_at),
    status = CASE WHEN resources_contentengagement.is_completed OR EXCLUDED.is_completed THEN 'completed'
                  WHEN GREATEST(resources_contentengagement.completion_percentage, EXCLUDED.completion_percentage) > 0 THEN 'in_progress'
                  ELSE 'started' END
RETURNING view_count, active_time_seconds, completion_percentage, last_position, is_completed, status,
          first_accessed, last_accessed, completed_at;

-- name: ContinueLearning :many
-- Items the student started and hasn't finished, most recent first.
SELECT e.content_item_id, e.completion_percentage, e.last_position, e.last_accessed,
       i.title, i.content_type, i.external_url, i.file, i.duration_seconds
FROM resources_contentengagement e
JOIN resources_contentitem i ON i.id = e.content_item_id
WHERE e.student_id = $1 AND NOT e.is_completed AND i.archived_at IS NULL
ORDER BY e.last_accessed DESC NULLS LAST
LIMIT 20;

-- ---- class reading lists (playbook: "teacher-curated class reading lists",
-- "assign required readings with target completion dates") -----------------

-- name: LibraryClassOwner :one
SELECT institution_id, teacher_id FROM classes_class WHERE id = $1;

-- name: ShareItemWithClass :exec
INSERT INTO resources_contentvisibilityrule (created_at, content_item_id, target_class_id)
SELECT now(), sqlc.arg(item_id), sqlc.arg(class_id)
WHERE NOT EXISTS (SELECT 1 FROM resources_contentvisibilityrule
                  WHERE content_item_id = sqlc.arg(item_id) AND target_class_id = sqlc.arg(class_id));

-- name: AssignItemToClass :execrows
-- One assignment per actively enrolled student; sharing again updates the
-- due date and reactivates it.
INSERT INTO resources_contentassignment (
    id, assigned_by_type, assignment_type, priority, note, due_date, is_active, created_at, updated_at,
    assigned_by_id, content_item_id, student_id, target_class_id)
SELECT gen_random_uuid(), 'teacher', sqlc.arg(assignment_type), 'medium', sqlc.arg(note), sqlc.narg(due_date),
       true, now(), now(), sqlc.arg(assigned_by), sqlc.arg(item_id), e.student_id, sqlc.arg(class_id)
FROM classes_classenrollment e
WHERE e.enrolled_class_id = sqlc.arg(class_id) AND e.status = 'active'
ON CONFLICT (content_item_id, student_id, assigned_by_type) DO UPDATE SET
    assignment_type = EXCLUDED.assignment_type, note = EXCLUDED.note, due_date = EXCLUDED.due_date,
    is_active = true, target_class_id = EXCLUDED.target_class_id, updated_at = now();

-- name: PromoteItemToClass :exec
-- A teacher's private item becomes visible to the classes it is shared with.
UPDATE resources_contentitem SET visibility_scope = 'class', updated_at = now()
WHERE id = $1 AND visibility_scope = 'private';

-- name: UnshareItemFromClass :exec
DELETE FROM resources_contentvisibilityrule WHERE content_item_id = sqlc.arg(item_id) AND target_class_id = sqlc.arg(class_id);

-- name: DeactivateClassAssignments :exec
UPDATE resources_contentassignment SET is_active = false, updated_at = now()
WHERE content_item_id = sqlc.arg(item_id) AND target_class_id = sqlc.arg(class_id);

-- name: ClassReadingList :many
-- Items shared with a class, with how many of its students have finished.
SELECT i.id, i.title, i.content_type, i.external_url, i.file,
       min(a.due_date)::timestamptz AS due_date, COALESCE(bool_or(a.assignment_type = 'required'), false)::boolean AS required,
       count(DISTINCT a.student_id) AS assigned,
       count(DISTINCT e.student_id) FILTER (WHERE e.is_completed) AS completed
FROM resources_contentvisibilityrule r
JOIN resources_contentitem i ON i.id = r.content_item_id AND i.archived_at IS NULL
LEFT JOIN resources_contentassignment a ON a.content_item_id = i.id AND a.target_class_id = r.target_class_id AND a.is_active
LEFT JOIN resources_contentengagement e ON e.content_item_id = i.id AND e.student_id = a.student_id
WHERE r.target_class_id = $1
GROUP BY i.id, i.title, i.content_type, i.external_url, i.file
ORDER BY min(a.due_date) NULLS LAST, i.title;

-- name: AssignedReading :many
-- Active reading assigned to these learners, with each one's progress.
SELECT a.id, a.student_id, a.assignment_type, a.note, a.due_date, a.target_class_id,
       i.id AS item_id, i.title, i.content_type, i.external_url, i.file,
       COALESCE(e.completion_percentage, 0)::numeric AS completion, COALESCE(e.is_completed, false)::boolean AS is_completed
FROM resources_contentassignment a
JOIN resources_contentitem i ON i.id = a.content_item_id AND i.archived_at IS NULL
LEFT JOIN resources_contentengagement e ON e.content_item_id = i.id AND e.student_id = a.student_id
WHERE a.is_active AND a.student_id = ANY(sqlc.arg(learner_ids)::bigint[])
ORDER BY COALESCE(e.is_completed, false), a.due_date NULLS LAST, i.title;
