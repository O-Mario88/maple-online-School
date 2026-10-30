-- The curriculum: read only. Curriculum content is loaded by seed scripts.

-- name: ListCountries :many
SELECT id, code, name, active FROM curriculum_country ORDER BY name;

-- name: ListClassLevels :many
SELECT id, name, level_id, internal_canonical_grade FROM curriculum_classlevel ORDER BY internal_canonical_grade, id;

-- name: ListSubjects :many
SELECT id, name, code FROM curriculum_subject ORDER BY name;

-- name: GetSubject :one
SELECT id, name, code FROM curriculum_subject WHERE id = $1;

-- name: ListTopics :many
SELECT t.id, t.name, t."order", t.subject_id, t.class_level_id, cl.name AS class_level_name
FROM curriculum_topic t
JOIN curriculum_classlevel cl ON cl.id = t.class_level_id
WHERE (sqlc.narg(subject_id)::bigint IS NULL OR t.subject_id = sqlc.narg(subject_id)::bigint)
  AND (sqlc.narg(class_level_id)::bigint IS NULL OR t.class_level_id = sqlc.narg(class_level_id)::bigint)
ORDER BY cl.internal_canonical_grade, t."order", t.id;

-- name: GetTopic :one
SELECT t.id, t.name, t."order", t.subject_id, t.class_level_id, cl.name AS class_level_name
FROM curriculum_topic t
JOIN curriculum_classlevel cl ON cl.id = t.class_level_id
WHERE t.id = $1;

-- name: ListCompetencies :many
SELECT id, description, code, curriculum_version_id, topic_id
FROM curriculum_topiccompetency
WHERE sqlc.narg(topic_id)::bigint IS NULL OR topic_id = sqlc.narg(topic_id)::bigint
ORDER BY topic_id, id;

-- name: TreeRows :many
-- Every education level, class level and topic with its subject, in display order.
SELECT el.id AS level_id, el.name AS level_name, cl.id AS class_id, cl.name AS class_name,
       t.id AS topic_id, t.name AS topic_name, s.id AS subject_id, s.name AS subject_name
FROM curriculum_educationlevel el
JOIN curriculum_classlevel cl ON cl.level_id = el.id
LEFT JOIN curriculum_topic t ON t.class_level_id = cl.id
LEFT JOIN curriculum_subject s ON s.id = t.subject_id
ORDER BY el.id, cl.internal_canonical_grade, cl.id, t."order", t.id;
