-- +goose Up
-- The Uganda national curriculum (NCDC), registered by default so every school
-- starts with it: nursery, primary (thematic P1-P3, subjects P4-P7), lower
-- secondary (competency-based S1-S4) and advanced secondary (S5-S6).
--
-- Subjects are shared across levels by code. Which subjects a class level
-- offers, and which are compulsory, lives in curriculum_subjectcombination.
-- Elective limits, alternatives, components, exams and A-Level combinations
-- live in curriculum_subjectselectionrule. Re-running inserts nothing twice.

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_subject_code_uniq ON curriculum_subject (code) WHERE code IS NOT NULL;

INSERT INTO curriculum_country (code, name, active)
SELECT 'UG', 'Uganda', true
WHERE NOT EXISTS (SELECT 1 FROM curriculum_country WHERE code = 'UG');

INSERT INTO curriculum_curriculumtrack (name, country_id)
SELECT 'NCDC', c.id FROM curriculum_country c
WHERE c.code = 'UG'
  AND NOT EXISTS (SELECT 1 FROM curriculum_curriculumtrack t WHERE t.country_id = c.id AND t.name = 'NCDC');

CREATE TEMP TABLE seed_levels (name text, is_primary boolean) ON COMMIT DROP;
INSERT INTO seed_levels VALUES
  ('Nursery', false),
  ('Primary', true),
  ('Lower Secondary', false),
  ('Advanced Secondary', false);

INSERT INTO curriculum_educationlevel (name, track_id, is_primary)
SELECT s.name, t.id, s.is_primary
FROM seed_levels s
CROSS JOIN curriculum_curriculumtrack t
JOIN curriculum_country c ON c.id = t.country_id AND c.code = 'UG'
WHERE t.name = 'NCDC'
  AND NOT EXISTS (SELECT 1 FROM curriculum_educationlevel e WHERE e.track_id = t.id AND e.name = s.name);

CREATE TEMP TABLE seed_classes (level text, name text, grade int) ON COMMIT DROP;
INSERT INTO seed_classes VALUES
  ('Nursery', 'Baby Class', -2), ('Nursery', 'Middle Class', -1), ('Nursery', 'Top Class', 0),
  ('Primary', 'P1', 1), ('Primary', 'P2', 2), ('Primary', 'P3', 3), ('Primary', 'P4', 4),
  ('Primary', 'P5', 5), ('Primary', 'P6', 6), ('Primary', 'P7', 7),
  ('Lower Secondary', 'S1', 8), ('Lower Secondary', 'S2', 9), ('Lower Secondary', 'S3', 10), ('Lower Secondary', 'S4', 11),
  ('Advanced Secondary', 'S5', 12), ('Advanced Secondary', 'S6', 13);

INSERT INTO curriculum_classlevel (name, level_id, internal_canonical_grade)
SELECT s.name, e.id, s.grade
FROM seed_classes s
JOIN curriculum_educationlevel e ON e.name = s.level
JOIN curriculum_curriculumtrack t ON t.id = e.track_id AND t.name = 'NCDC'
JOIN curriculum_country c ON c.id = t.country_id AND c.code = 'UG'
WHERE NOT EXISTS (SELECT 1 FROM curriculum_classlevel cl WHERE cl.level_id = e.id AND cl.name = s.name);

CREATE TEMP TABLE seed_subjects (code text, name text) ON COMMIT DROP;
INSERT INTO seed_subjects VALUES
  -- shared by several levels
  ('ENG', 'English'), ('MATH', 'Mathematics'), ('RE', 'Religious Education'), ('PE', 'Physical Education'),
  ('LL', 'Local Language'), ('KIS', 'Kiswahili'), ('AGR', 'Agriculture'), ('GEO', 'Geography'),
  ('BIO', 'Biology'), ('CHE', 'Chemistry'), ('PHY', 'Physics'), ('LIT', 'Literature in English'),
  ('ART', 'Art and Design'), ('FRE', 'French'), ('GER', 'German'), ('ARA', 'Arabic'), ('LAT', 'Latin'), ('CHI', 'Chinese'),
  -- lower primary learning areas
  ('LIT1', 'Literacy I'), ('LIT2', 'Literacy II'), ('CPA', 'Creative Performing Arts'), ('NEWS', 'News'),
  -- upper primary
  ('ISC', 'Integrated Science'), ('SST', 'Social Studies'), ('CAPE', 'Creative Arts and Physical Education'),
  -- lower secondary
  ('SGN', 'Sign Language'), ('GSC', 'General Science'), ('HPE', 'History and Political Education'),
  ('PA', 'Performing Arts'), ('NFT', 'Nutrition and Food Technology'), ('ENT', 'Entrepreneurship'),
  ('ICT', 'Information and Communication Technology'), ('TD', 'Technology and Design'),
  -- advanced secondary
  ('PMATH', 'Principal Mathematics'), ('HIS', 'History'), ('ECO', 'Economics'), ('ENTED', 'Entrepreneurship Education'),
  ('CRE', 'Christian Religious Education'), ('IRE', 'Islamic Religious Education'), ('MUS', 'Music'),
  ('CT', 'Clothing and Textile'), ('FN', 'Food and Nutrition'), ('MW', 'Metal Work'), ('WW', 'Wood Work'),
  ('TDR', 'Technical Drawing'), ('GP', 'General Paper'), ('SMATH', 'Subsidiary Mathematics'), ('SICT', 'Subsidiary ICT');

INSERT INTO curriculum_subject (name, code)
SELECT s.name, s.code FROM seed_subjects s
WHERE NOT EXISTS (SELECT 1 FROM curriculum_subject x WHERE x.code = s.code);

-- What each class level offers. core = compulsory for every learner.
CREATE TEMP TABLE seed_offers (classes text[], code text, core boolean) ON COMMIT DROP;
INSERT INTO seed_offers
SELECT '{P1,P2,P3}'::text[], code, true FROM unnest('{MATH,ENG,LIT1,LIT2,PE,RE,CPA,NEWS}'::text[]) AS code
UNION ALL
SELECT '{P4,P5,P6,P7}'::text[], code, true FROM unnest('{ENG,MATH,ISC,SST,RE,LL,CAPE}'::text[]) AS code
UNION ALL
SELECT '{S1,S2}'::text[], code, code = ANY('{ENG,ENT,MATH,BIO,CHE,PHY,GEO,HPE,KIS,PE,RE}'::text[])
FROM unnest('{ENG,SGN,LIT,MATH,BIO,CHE,PHY,GSC,HPE,GEO,FRE,GER,ARA,LAT,CHI,LL,KIS,ART,RE,PA,AGR,NFT,ENT,PE,ICT,TD}'::text[]) AS code
UNION ALL
SELECT '{S3,S4}'::text[], code, code = ANY('{MATH,ENG,CHE,BIO,PHY,GEO,HPE}'::text[])
FROM unnest('{ENG,SGN,LIT,MATH,BIO,CHE,PHY,GSC,HPE,GEO,FRE,GER,ARA,LAT,CHI,LL,KIS,ART,RE,PA,AGR,NFT,ENT,PE,ICT,TD}'::text[]) AS code
UNION ALL
SELECT '{S5,S6}'::text[], code, code = 'GP'
FROM unnest('{BIO,CHE,PHY,PMATH,AGR,GEO,HIS,ECO,ENTED,CRE,IRE,LIT,ARA,CHI,FRE,GER,KIS,LAT,LL,ART,MUS,CT,FN,MW,WW,TDR,GP,SMATH,SICT}'::text[]) AS code;

INSERT INTO curriculum_subjectcombination (class_level_id, subject_id, is_core)
SELECT cl.id, s.id, o.core
FROM seed_offers o
CROSS JOIN LATERAL unnest(o.classes) AS cname
JOIN curriculum_classlevel cl ON cl.name = cname
JOIN curriculum_educationlevel e ON e.id = cl.level_id
JOIN curriculum_curriculumtrack t ON t.id = e.track_id AND t.name = 'NCDC'
JOIN curriculum_country c ON c.id = t.country_id AND c.code = 'UG'
JOIN curriculum_subject s ON s.code = o.code
WHERE NOT EXISTS (SELECT 1 FROM curriculum_subjectcombination x WHERE x.class_level_id = cl.id AND x.subject_id = s.id);

-- Rules, keyed by "key" so each is inserted once.
CREATE TEMP TABLE seed_rules (payload jsonb) ON COMMIT DROP;
INSERT INTO seed_rules VALUES
  ('{"key":"approach-p1-p3","kind":"approach","classes":["P1","P2","P3"],"approach":"thematic",
     "structure":["Learning area","Themes","Competencies","Lessons","Activities","Assessments"]}'),
  ('{"key":"approach-p4-p7","kind":"approach","classes":["P4","P5","P6","P7"],"approach":"subject",
     "structure":["Subject","Topics","Competencies","Lessons","Assessments"]}'),
  ('{"key":"approach-s1-s4","kind":"approach","classes":["S1","S2","S3","S4"],"approach":"competency_based",
     "structure":["Subject","Topics","Competencies","Lessons","Assessments"]}'),
  ('{"key":"approach-s5-s6","kind":"approach","classes":["S5","S6"],"approach":"competency_based",
     "structure":["Subject","Topics","Competencies","Lessons","Live classes","Assignments","Activities of integration","Assessments"]}'),
  ('{"key":"components-re-primary","kind":"components","classes":["P1","P2","P3","P4","P5","P6","P7"],"subject":"RE",
     "components":["Christian Religious Education (CRE)","Islamic Religious Education (IRE)"],"choose":1}'),
  ('{"key":"components-cpa","kind":"components","classes":["P1","P2","P3"],"subject":"CPA",
     "components":["Art and Crafts","Music"]}'),
  ('{"key":"components-cape","kind":"components","classes":["P4","P5","P6","P7"],"subject":"CAPE",
     "components":["CAPE 1: Music, Dance and Drama","CAPE 2: Physical Education","CAPE 3: Art and Technology"]}'),
  ('{"key":"components-isc","kind":"components","classes":["P4","P5","P6","P7"],"subject":"ISC",
     "components":["Science","Agriculture"]}'),
  ('{"key":"components-ll","kind":"components","classes":["P4","P5","P6","P7","S1","S2","S3","S4","S5","S6"],"subject":"LL",
     "components":["Luganda","Ateso","Leb Acoli","Other approved local languages"],"choose":1}'),
  ('{"key":"exam-ple","kind":"exam","board":"UNEB","name":"Primary Leaving Examination (PLE)","classes":["P7"],
     "subjects":["ENG","MATH","ISC","SST"],"note":"Religious Education is assessed within Social Studies."}'),
  ('{"key":"exam-uce","kind":"exam","board":"UNEB","name":"Uganda Certificate of Education (UCE)","classes":["S4"]}'),
  ('{"key":"exam-uace","kind":"exam","board":"UNEB","name":"Uganda Advanced Certificate of Education (UACE)","classes":["S6"]}'),
  ('{"key":"alt-sign-language","kind":"alternative","classes":["S1","S2","S3","S4"],"subject":"SGN","replaces":["ENG"],
     "note":"Sign Language may be taken in place of English."}'),
  ('{"key":"alt-general-science","kind":"alternative","classes":["S1","S2","S3","S4"],"subject":"GSC","replaces":["BIO","CHE","PHY"],
     "note":"General Science may replace Biology, Chemistry and Physics for some learners with special educational needs."}'),
  ('{"key":"electives-s3-s4","kind":"elective_limit","classes":["S3","S4"],"max_electives":2}'),
  ('{"key":"a-level-principals","kind":"principal_subjects","classes":["S5","S6"],"principals":3,
     "subsidiaries":{"required":["GP"],"choose_one":["SMATH","SICT"]},
     "note":"Learners study three principal subjects with General Paper and one subsidiary."}'),
  ('{"key":"a-level-groups","kind":"subject_groups","classes":["S5","S6"],"groups":[
     {"code":"A","name":"Sciences and Mathematics","subjects":["BIO","CHE","PHY","PMATH","AGR"]},
     {"code":"B","name":"Humanities and Social Sciences","subjects":["GEO","HIS","ECO","ENTED","CRE","IRE","LIT"]},
     {"code":"C","name":"Languages","subjects":["ARA","CHI","FRE","GER","KIS","LAT","LL"]},
     {"code":"D","name":"Creative, Technical and Vocational","subjects":["ART","MUS","CT","FN","MW","WW","TDR"]},
     {"code":"E","name":"Subsidiary","subjects":["GP","SMATH","SICT"]}]}'),
  ('{"key":"a-level-combinations","kind":"combinations","classes":["S5","S6"],
     "note":"Common combinations offered by schools, and schools may configure their own.","combinations":[
     {"code":"PCM","subjects":["PHY","CHE","PMATH"]},
     {"code":"PCB","subjects":["PHY","CHE","BIO"]},
     {"code":"BCM","subjects":["BIO","CHE","PMATH"]},
     {"code":"PEM","subjects":["PHY","ECO","PMATH"]},
     {"code":"MEG","subjects":["PMATH","ECO","GEO"]},
     {"code":"HEG","subjects":["HIS","ECO","GEO"]},
     {"code":"HED","subjects":["HIS","ECO","CRE"]},
     {"code":"HEL","subjects":["HIS","ECO","LIT"]},
     {"code":"LEG","subjects":["LIT","ECO","GEO"]},
     {"code":"DEG","subjects":["CRE","ECO","GEO"]},
     {"code":"BAG","subjects":["BIO","AGR","GEO"]}]}');

INSERT INTO curriculum_subjectselectionrule (track_id, rule_payload)
SELECT t.id, r.payload
FROM seed_rules r
CROSS JOIN curriculum_curriculumtrack t
JOIN curriculum_country c ON c.id = t.country_id AND c.code = 'UG'
WHERE t.name = 'NCDC'
  AND NOT EXISTS (SELECT 1 FROM curriculum_subjectselectionrule x
                  WHERE x.track_id = t.id AND x.rule_payload->>'key' = r.payload->>'key');

-- +goose Down
-- The seeded curriculum may already be in use by classes, topics and fees, so
-- it is left in place.
DROP INDEX IF EXISTS curriculum_subject_code_uniq;
