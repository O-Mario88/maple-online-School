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

-- name: ProgrammeRows :many
-- A country's curriculum: each class level with the subjects it offers.
SELECT t.id AS track_id, t.name AS track_name, el.id AS level_id, el.name AS level_name,
       cl.id AS class_id, cl.name AS class_name, cl.internal_canonical_grade AS grade,
       COALESCE(s.id, 0)::bigint AS subject_id, COALESCE(s.code, '')::text AS subject_code,
       COALESCE(s.name, '')::text AS subject_name, COALESCE(sc.is_core, false)::boolean AS compulsory
FROM curriculum_country c
JOIN curriculum_curriculumtrack t ON t.country_id = c.id
JOIN curriculum_educationlevel el ON el.track_id = t.id
JOIN curriculum_classlevel cl ON cl.level_id = el.id
LEFT JOIN curriculum_subjectcombination sc ON sc.class_level_id = cl.id
LEFT JOIN curriculum_subject s ON s.id = sc.subject_id
WHERE c.code = sqlc.arg(country)::text
ORDER BY t.id, cl.internal_canonical_grade, cl.id, sc.is_core DESC, s.name;

-- name: ProgrammeRules :many
SELECT r.track_id, r.rule_payload
FROM curriculum_subjectselectionrule r
JOIN curriculum_curriculumtrack t ON t.id = r.track_id
JOIN curriculum_country c ON c.id = t.country_id
WHERE c.code = sqlc.arg(country)::text
ORDER BY r.id;
