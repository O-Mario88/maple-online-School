-- Sample School Network schools for local development and demos: the six
-- illustrative schools from the app's design data. Running it again updates
-- them in place. Never run against production (the command refuses).

CREATE TEMP TABLE sample_schools (
    slug text, name text, town text, district text, curricula text[], levels text[], stay text, mode text,
    programs text[], facilities text[], blurb text, pass_rate smallint, pass_source text, learners int,
    established smallint, scholarships boolean, opens date, deadline date, fee_min bigint, fee_max bigint,
    requirements text[], listed_at timestamptz
) ON COMMIT DROP;

INSERT INTO sample_schools VALUES
('lakeview', 'Lakeview International School', 'Kampala', 'Kampala', '{UNEB}', '{O-Level,A-Level}', 'Day & Boarding', 'Physical',
 '{Sciences,Arts}', '{"Science laboratories",Library,"Boarding houses","Sports fields"}',
 'A leading school offering a strong academic program, modern facilities and holistic development.',
 98, 'school-published, verified by Maple', 1240, 2008, false, '2026-11-01', '2027-01-15', 1800000, 2600000,
 '{"Latest report card","Birth certificate","PLE or UCE results slip"}', '2026-03-01'),
('riverside', 'Riverside High School', 'Entebbe', 'Wakiso', '{UNEB}', '{A-Level}', 'Day', 'Hybrid',
 '{STEM}', '{"Robotics lab","Computer labs","Online classrooms"}',
 'Academic excellence with a focus on STEM, innovation and real-world skills.',
 96, 'school-published, verified by Maple', 980, 2012, true, '2026-10-15', '2026-12-20', 1400000, 1900000,
 '{"UCE results slip","Latest report card"}', '2026-09-20'),
('greenhill', 'Greenhill Academy', 'Jinja', 'Jinja', '{UNEB}', '{O-Level,A-Level}', 'Day', 'Physical',
 '{Sciences,Business}', '{"Science laboratories","Music room","Football pitch"}',
 'A values-based school with strong results, experienced teachers and a vibrant student life.',
 95, 'school-published, verified by Maple', 780, 2010, false, '2026-11-01', '2027-01-31', 1100000, 1500000,
 '{"Latest report card","PLE or UCE results slip"}', '2026-10-30'),
('kigezi', 'Kigezi Hills College', 'Kabale', 'Kabale', '{UNEB}', '{O-Level,A-Level}', 'Boarding', 'Physical',
 '{Agriculture,Sciences}', '{"School farm","Boarding houses","Science laboratories"}',
 'A boarding college in the hills known for agriculture, sciences and strong discipline.',
 93, 'school-published, verified by Maple', 1560, 1998, true, '2026-11-01', '2027-01-10', 1300000, 1700000,
 '{"Latest report card","Medical form"}', '2026-05-12'),
('stmarys', 'St. Mary’s Girls’ School', 'Mbarara', 'Mbarara', '{UNEB}', '{O-Level,A-Level}', 'Boarding', 'Physical',
 '{Sciences,Music}', '{Chapel,"Music rooms","Science laboratories","Boarding houses"}',
 'A girls’ boarding school with top science results and a celebrated music program.',
 97, 'school-published, verified by Maple', 1100, 1985, true, '2026-11-01', '2027-01-20', 1900000, 2400000,
 '{"Latest report card",Interview}', '2026-07-08'),
('maple-online', 'Maple Online Academy', 'Online', 'Kampala', '{UNEB,Cambridge}', '{O-Level,A-Level}', 'Day', 'Online',
 '{STEM,ICT}', '{"Live classrooms","Digital library",Tutoring}',
 'Fully online classes with live teachers, recorded lessons and exam preparation from anywhere.',
 91, 'Maple-published', 3400, 2024, false, NULL, NULL, 600000, 900000,
 '{"Latest report card"}', '2026-06-01');

-- The schools themselves, found again by slug on later runs.
INSERT INTO institutions_institution (name, slug, primary_color, secondary_color, country_code, curriculum_track,
  subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
SELECT s.name, 'network-' || s.slug, '#1463F3', '#FFFFFF', 'UG', 'uganda', 'growth', true, now(), '[]', 'secondary', false
FROM sample_schools s
WHERE NOT EXISTS (SELECT 1 FROM institutions_institution i WHERE i.slug = 'network-' || s.slug);

INSERT INTO network_profiles (school_id, slug, town, district, curricula, levels, stay, mode, programs, facilities, blurb,
  pass_rate, pass_board, pass_exam, pass_year, pass_source, learners, established, scholarships,
  admissions_opens, admissions_deadline, fee_min_ugx, fee_max_ugx, requirements, verified_at, published_at)
SELECT i.id, s.slug, s.town, s.district, s.curricula, s.levels, s.stay, s.mode, s.programs, s.facilities, s.blurb,
       s.pass_rate, 'UNEB', 'UCE', 2025, s.pass_source, s.learners, s.established, s.scholarships,
       s.opens, s.deadline, s.fee_min, s.fee_max, s.requirements, s.listed_at, s.listed_at
FROM sample_schools s JOIN institutions_institution i ON i.slug = 'network-' || s.slug
ON CONFLICT (school_id) DO UPDATE SET
  town = EXCLUDED.town, district = EXCLUDED.district, curricula = EXCLUDED.curricula, levels = EXCLUDED.levels,
  stay = EXCLUDED.stay, mode = EXCLUDED.mode, programs = EXCLUDED.programs, facilities = EXCLUDED.facilities,
  blurb = EXCLUDED.blurb, pass_rate = EXCLUDED.pass_rate, pass_source = EXCLUDED.pass_source, learners = EXCLUDED.learners,
  established = EXCLUDED.established, scholarships = EXCLUDED.scholarships, admissions_opens = EXCLUDED.admissions_opens,
  admissions_deadline = EXCLUDED.admissions_deadline, fee_min_ugx = EXCLUDED.fee_min_ugx, fee_max_ugx = EXCLUDED.fee_max_ugx,
  requirements = EXCLUDED.requirements, verified_at = EXCLUDED.verified_at, published_at = EXCLUDED.published_at, updated_at = now();

-- Every sample school uses the same application form as the app's design.
UPDATE network_profiles SET
  apply_intake = 'Term 1, 2027',
  apply_fee_ugx = 50000,
  apply_programs = '{"Senior Secondary (S.1)","Senior Five (S.5)"}',
  apply_documents = '[{"id":"report","label":"Previous academic report (last 2 years)"},{"id":"birth","label":"Birth certificate or age proof"},{"id":"photo","label":"Passport-size photo (recent)"},{"id":"guardianId","label":"Parent/guardian identification (National ID)"}]'
WHERE slug IN (SELECT slug FROM sample_schools);

-- Verified exam centres.
INSERT INTO network_exam_centres (school_id, boards, exams, external, register_by, fee_ugx, verified_at)
SELECT p.school_id, '{UNEB}', c.exams, c.external, '2027-02-28', c.fee, now()
FROM (VALUES ('lakeview', '{UCE,UACE}'::text[], true, 220000::bigint),
             ('greenhill', '{UCE}'::text[], true, 200000::bigint),
             ('kigezi', '{UCE,UACE}'::text[], false, 210000::bigint)) AS c(slug, exams, external, fee)
JOIN network_profiles p ON p.slug = c.slug
ON CONFLICT (school_id) DO UPDATE SET exams = EXCLUDED.exams, external = EXCLUDED.external,
  register_by = EXCLUDED.register_by, fee_ugx = EXCLUDED.fee_ugx, verified_at = EXCLUDED.verified_at;

-- Teaching vacancies, replaced on each run.
DELETE FROM network_vacancies WHERE school_id IN (SELECT school_id FROM network_profiles WHERE slug IN (SELECT slug FROM sample_schools));
INSERT INTO network_vacancies (school_id, title, kind, closes_on, subjects)
SELECT p.school_id, v.title, v.kind, v.closes, v.subjects
FROM (VALUES ('lakeview', 'Mathematics Teacher (O-Level)', 'Full-time', '2026-11-30'::date, '{Mathematics}'::text[]),
             ('riverside', 'Physics & Robotics Teacher', 'Full-time · Hybrid', '2026-12-15'::date, '{Physics,ICT}'::text[]),
             ('maple-online', 'Online Chemistry Tutor', 'Part-time · Online', '2026-12-20'::date, '{Chemistry}'::text[]),
             ('stmarys', 'Music Teacher', 'Full-time', '2027-01-10'::date, '{Music}'::text[])) AS v(slug, title, kind, closes, subjects)
JOIN network_profiles p ON p.slug = v.slug;
