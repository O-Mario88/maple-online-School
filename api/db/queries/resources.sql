-- Resource library and class resource links. Go owns writes to these tables;
-- file uploads still go through Django's resources-upload endpoint.
--
-- Who sees a resource: everyone signed in for platform-shared and marketplace
-- resources, active members of the owning school for institution-only ones,
-- and the uploader for private ones.

-- name: MemberSchoolIDs :many
SELECT DISTINCT institution_id
FROM institutions_institutionmembership
WHERE user_id = $1 AND status = 'active';

-- name: CountVisibleResources :one
SELECT count(*)
FROM resources_resource r
WHERE (r.visibility IN ('platform_shared', 'marketplace_public')
       OR (r.visibility = 'institution_only' AND r.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
       OR (r.visibility = 'private' AND r.uploaded_by_id = sqlc.arg(viewer_id)))
  AND (sqlc.narg(category)::text IS NULL OR r.category = sqlc.narg(category))
  AND (sqlc.narg(subject_id)::bigint IS NULL OR r.subject_id = sqlc.narg(subject_id))
  AND (sqlc.narg(visibility)::text IS NULL OR r.visibility = sqlc.narg(visibility))
  AND (sqlc.narg(search)::text IS NULL
       OR r.title ILIKE sqlc.narg(search) OR r.description ILIKE sqlc.narg(search) OR r.author ILIKE sqlc.narg(search));

-- name: ListVisibleResources :many
SELECT r.id, r.owner_type, r.title, r.file_path, r.external_url, r.vimeo_video_id, r.visibility,
       r.created_at, r.class_level_id, r.owner_institution_id, r.subject_id, r.topic_id,
       r.uploaded_by_id, r.description, r.author, r.category, r.price, r.rating, r.is_featured,
       COALESCE(NULLIF(r.author, ''), NULLIF(u.full_name, ''), u.email)::text AS author_name
FROM resources_resource r
JOIN accounts_user u ON u.id = r.uploaded_by_id
WHERE (r.visibility IN ('platform_shared', 'marketplace_public')
       OR (r.visibility = 'institution_only' AND r.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
       OR (r.visibility = 'private' AND r.uploaded_by_id = sqlc.arg(viewer_id)))
  AND (sqlc.narg(category)::text IS NULL OR r.category = sqlc.narg(category))
  AND (sqlc.narg(subject_id)::bigint IS NULL OR r.subject_id = sqlc.narg(subject_id))
  AND (sqlc.narg(visibility)::text IS NULL OR r.visibility = sqlc.narg(visibility))
  AND (sqlc.narg(search)::text IS NULL
       OR r.title ILIKE sqlc.narg(search) OR r.description ILIKE sqlc.narg(search) OR r.author ILIKE sqlc.narg(search))
ORDER BY
  CASE WHEN sqlc.arg(sort)::text = 'created_at' THEN r.created_at END ASC,
  CASE WHEN sqlc.arg(sort)::text = '-created_at' THEN r.created_at END DESC,
  CASE WHEN sqlc.arg(sort)::text = 'rating' THEN r.rating END ASC,
  CASE WHEN sqlc.arg(sort)::text = '-rating' THEN r.rating END DESC,
  CASE WHEN sqlc.arg(sort)::text = 'price' THEN r.price END ASC,
  CASE WHEN sqlc.arg(sort)::text = '-price' THEN r.price END DESC,
  r.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetVisibleResource :one
SELECT r.id, r.owner_type, r.title, r.file_path, r.external_url, r.vimeo_video_id, r.visibility,
       r.created_at, r.class_level_id, r.owner_institution_id, r.subject_id, r.topic_id,
       r.uploaded_by_id, r.description, r.author, r.category, r.price, r.rating, r.is_featured,
       COALESCE(NULLIF(r.author, ''), NULLIF(u.full_name, ''), u.email)::text AS author_name
FROM resources_resource r
JOIN accounts_user u ON u.id = r.uploaded_by_id
WHERE r.id = sqlc.arg(id)
  AND (r.visibility IN ('platform_shared', 'marketplace_public')
       OR (r.visibility = 'institution_only' AND r.owner_institution_id = ANY(sqlc.arg(member_schools)::bigint[]))
       OR (r.visibility = 'private' AND r.uploaded_by_id = sqlc.arg(viewer_id)));

-- name: CreateResource :one
INSERT INTO resources_resource (
    owner_type, title, external_url, vimeo_upload_status, visibility, created_at,
    class_level_id, owner_institution_id, subject_id, topic_id, uploaded_by_id,
    description, author, category, price, rating, is_featured)
VALUES (sqlc.arg(owner_type), sqlc.arg(title), sqlc.narg(external_url), 'none', sqlc.arg(visibility), now(),
        sqlc.narg(class_level_id), sqlc.narg(owner_institution_id), sqlc.narg(subject_id), sqlc.narg(topic_id),
        sqlc.arg(uploaded_by_id), sqlc.narg(description), sqlc.narg(author), sqlc.narg(category),
        sqlc.arg(price), 4.00, false)
RETURNING id;

-- name: UpdateResource :exec
UPDATE resources_resource
SET owner_type = sqlc.arg(owner_type), title = sqlc.arg(title), external_url = sqlc.narg(external_url),
    visibility = sqlc.arg(visibility), class_level_id = sqlc.narg(class_level_id),
    owner_institution_id = sqlc.narg(owner_institution_id), subject_id = sqlc.narg(subject_id),
    topic_id = sqlc.narg(topic_id), description = sqlc.narg(description), author = sqlc.narg(author),
    category = sqlc.narg(category), price = sqlc.arg(price)
WHERE id = sqlc.arg(id);

-- name: UnlinkResourceStudyTasks :exec
UPDATE intelligence_studytask SET linked_resource_id = NULL WHERE linked_resource_id = $1;

-- name: DeleteResourceLessonLinks :exec
DELETE FROM resources_resourcelessonlink WHERE resource_id = $1;

-- name: DeleteResourceEngagement :exec
DELETE FROM resources_resourceengagementrecord WHERE resource_id = $1;

-- name: DeleteResourceClassLinks :exec
DELETE FROM resources_sharedresourcelink WHERE resource_id = $1;

-- name: DeleteResource :exec
DELETE FROM resources_resource WHERE id = $1;

-- Who sees a class link: staff of the class's school, and students (or their
-- approved parents) enrolled in the class.

-- name: CountVisibleClassLinks :one
SELECT count(*)
FROM resources_sharedresourcelink l
JOIN classes_class c ON c.id = l.target_class_id
WHERE (c.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR EXISTS (SELECT 1 FROM classes_classenrollment e
                  WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                    AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[])))
  AND (sqlc.narg(target_class)::bigint IS NULL OR l.target_class_id = sqlc.narg(target_class))
  AND (sqlc.narg(resource)::bigint IS NULL OR l.resource_id = sqlc.narg(resource));

-- name: ListVisibleClassLinks :many
SELECT l.id, l.added_at, l.added_by_id, l.resource_id, l.target_class_id, r.title AS resource_title
FROM resources_sharedresourcelink l
JOIN classes_class c ON c.id = l.target_class_id
JOIN resources_resource r ON r.id = l.resource_id
WHERE (c.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR EXISTS (SELECT 1 FROM classes_classenrollment e
                  WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                    AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[])))
  AND (sqlc.narg(target_class)::bigint IS NULL OR l.target_class_id = sqlc.narg(target_class))
  AND (sqlc.narg(resource)::bigint IS NULL OR l.resource_id = sqlc.narg(resource))
ORDER BY l.added_at DESC, l.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: ClassOwner :one
SELECT institution_id, teacher_id FROM classes_class WHERE id = $1;

-- name: CreateClassLink :one
INSERT INTO resources_sharedresourcelink (added_at, added_by_id, resource_id, target_class_id)
VALUES (now(), $1, $2, $3)
ON CONFLICT (resource_id, target_class_id) DO NOTHING
RETURNING id, added_at;

-- name: GetClassLink :one
SELECT l.id, l.added_by_id, c.institution_id, c.teacher_id
FROM resources_sharedresourcelink l
JOIN classes_class c ON c.id = l.target_class_id
WHERE l.id = $1;

-- name: DeleteClassLink :exec
DELETE FROM resources_sharedresourcelink WHERE id = $1;
