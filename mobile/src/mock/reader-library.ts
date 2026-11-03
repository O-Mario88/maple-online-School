/**
 * Subject outlines for the Digital Library reader: every book, video and resource in a subject is
 * built from its subject's outline. Content is illustrative, written for Primary 6.
 */
import type { Outline } from '@/features/learner/reader/catalog';

const ch = (title: string, summary: string, keyIdea: string, points: readonly string[]) => ({ title, summary, keyIdea, points });
const q = (id: string, question: string, options: readonly string[], answer: number) => ({ id, q: question, options, answer });

export const outlines: Readonly<Record<string, Outline>> = {
  Mathematics: {
    about: 'number, fractions, measurement and problem solving for Primary 6, with worked examples and practice.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Buli namba erina ekifo kyayo, era ekifo kino kiraga omuwendo gwayo.' },
      { language: 'Kiswahili', text: 'Kila tarakimu ina nafasi yake, na nafasi hiyo inaonyesha thamani yake.' },
      { language: 'French', text: 'Chaque chiffre a sa place, et cette place indique sa valeur.' },
    ],
    units: [
      { title: 'Numbers and Operations', chapters: [ch('Whole Numbers', 'Read, write and compare numbers up to millions using place value.', 'Every digit has a place, and its place shows its value.', ['Place value to millions', 'Rounding off', 'Comparing numbers']), ch('Fractions and Decimals', 'A fraction names part of a whole; a decimal shows the same part in tenths and hundredths.', 'Fractions and decimals are two ways to show parts of a whole.', ['Equivalent fractions', 'Adding fractions', 'Changing fractions to decimals'])] },
      { title: 'Measurement and Geometry', chapters: [ch('Length, Mass and Capacity', 'Measure with metres, kilograms and litres, and change between units.', 'Standard units let everyone measure the same way.', ['1 km = 1,000 m', '1 kg = 1,000 g', '1 l = 1,000 ml']), ch('Shapes and Angles', 'Name shapes by their sides and angles, and measure angles with a protractor.', 'Shapes are described by their sides, angles and lines of symmetry.', ['Right, acute and obtuse angles', 'Triangles and quadrilaterals', 'Perimeter and area'])] },
    ],
    quiz: [q('q1', 'What is the value of 7 in 3,742?', ['7', '70', '700', '7,000'], 2), q('q2', '1/2 is the same as…', ['0.2', '0.5', '0.25', '2.0'], 1), q('q3', 'How many grams are in 2 kg?', ['20', '200', '2,000', '20,000'], 2), q('q4', 'An angle smaller than 90° is…', ['Right', 'Obtuse', 'Acute', 'Straight'], 2), q('q5', 'Perimeter of a 3 m by 2 m rectangle?', ['5 m', '6 m', '10 m', '12 m'], 2)],
    dictionary: { fraction: 'A number that names part of a whole, such as 1/2.', decimal: 'A number with a point, showing tenths and hundredths.', perimeter: 'The distance all the way round a shape.', angle: 'The amount of turn between two lines that meet.', denominator: 'The bottom number of a fraction: how many equal parts.' },
    activity: { title: 'Measure Your Classroom', steps: ['Measure the length and width of your classroom in metres.', 'Work out its perimeter and area.', 'Compare your answers with a friend and explain any difference.', 'Upload a photo of your working.'] },
    tutor: 'Let’s break it into steps: write what you know, choose the operation, then check your answer with an estimate.',
    related: [{ title: 'Fractions Made Simple', meta: 'Video • 7 min', kind: 'video' }, { title: 'Times Tables Practice', meta: 'Worksheet • 2 pages', kind: 'doc' }, { title: 'PLE Number Questions', meta: 'Practice • 4 pages (PDF)', kind: 'pdf' }],
  },
  English: {
    about: 'reading, grammar and writing for Primary 6, with stories, comprehension and composition practice.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Okusoma ennyo kukuyamba okuwandiika obulungi.' },
      { language: 'Kiswahili', text: 'Kusoma kwa wingi kunakusaidia kuandika vizuri.' },
      { language: 'French', text: 'Lire beaucoup t’aide à bien écrire.' },
    ],
    units: [
      { title: 'Reading and Comprehension', chapters: [ch('Reading for Meaning', 'Read a passage, find the main idea and the details that support it.', 'Good readers ask questions as they read.', ['Main idea', 'Supporting details', 'New words in context']), ch('Stories and Characters', 'Stories have characters, a setting and a problem that is solved.', 'Every story has a beginning, a middle and an end.', ['Characters', 'Setting', 'Plot'])] },
      { title: 'Grammar and Writing', chapters: [ch('Tenses and Sentences', 'Use the present, past and future tense correctly in full sentences.', 'A sentence needs a subject and a verb.', ['Simple present', 'Simple past', 'Future with will']), ch('Writing a Composition', 'Plan, write and check a composition with an introduction, body and conclusion.', 'Plan before you write, then check your spelling and punctuation.', ['Planning', 'Paragraphs', 'Editing'])] },
    ],
    quiz: [q('q1', 'Which is a verb?', ['Happy', 'Run', 'Table', 'Blue'], 1), q('q2', 'Past tense of "go"?', ['Goed', 'Gone', 'Went', 'Going'], 2), q('q3', 'Where a story happens is the…', ['Plot', 'Setting', 'Title', 'Theme'], 1), q('q4', 'A composition starts with…', ['A conclusion', 'An introduction', 'A list', 'A question only'], 1), q('q5', 'Which sentence is correct?', ['She go to school.', 'She goes to school.', 'She going school.', 'She gone school.'], 1)],
    dictionary: { comprehension: 'Understanding what you read or hear.', character: 'A person or animal in a story.', setting: 'The time and place where a story happens.', composition: 'A piece of writing on a topic.', tense: 'The form of a verb that shows when something happens.' },
    activity: { title: 'Write a Short Story', steps: ['Choose a character and a setting in your village or town.', 'Plan a problem and how it is solved.', 'Write three paragraphs: beginning, middle and end.', 'Read it aloud to a family member, then upload it.'] },
    tutor: 'Try reading the sentence aloud. Who or what is it about (the subject), and what are they doing (the verb)?',
    related: [{ title: 'Reading Strategies', meta: 'Video • 6 min', kind: 'video' }, { title: 'Comprehension Passages', meta: 'Worksheet • 3 pages', kind: 'doc' }, { title: 'Composition Guide', meta: 'Article • 4 pages (PDF)', kind: 'pdf' }],
  },
  Science: {
    about: 'living things, matter, energy and the world around us for Primary 6, with experiments and activities.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Abasayansi beetegereza, bagezesa, era bawandiika bye balaba.' },
      { language: 'Kiswahili', text: 'Wanasayansi huchunguza, hujaribu na huandika wanachokiona.' },
      { language: 'French', text: 'Les scientifiques observent, expérimentent et notent ce qu’ils voient.' },
    ],
    units: [
      { title: 'Living Things', chapters: [ch('Plants and Animals', 'Living things feed, grow, breathe, move and reproduce. Plants make their own food.', 'All living things need food, water and air.', ['Characteristics of living things', 'Photosynthesis', 'Food chains']), ch('The Human Body', 'Our body systems work together: digestion, breathing and blood circulation.', 'Healthy habits keep our body systems working well.', ['Digestive system', 'Breathing', 'Heart and blood'])] },
      { title: 'Matter and Energy', chapters: [ch('States of Matter', 'Matter can be solid, liquid or gas and can change state when heated or cooled.', 'Heating and cooling change the state of matter.', ['Solids, liquids, gases', 'Melting and freezing', 'Evaporation']), ch('Energy and Machines', 'Energy makes things move and work; simple machines make work easier.', 'Energy cannot be made or destroyed, only changed.', ['Sources of energy', 'Levers and pulleys', 'Saving energy'])] },
    ],
    quiz: [q('q1', 'Plants make food by…', ['Digestion', 'Photosynthesis', 'Evaporation', 'Breathing'], 1), q('q2', 'Water turning to vapour is…', ['Melting', 'Freezing', 'Evaporation', 'Condensation'], 2), q('q3', 'Which organ pumps blood?', ['Lungs', 'Heart', 'Stomach', 'Liver'], 1), q('q4', 'A lever is a…', ['Simple machine', 'Living thing', 'Gas', 'Food'], 0), q('q5', 'Which is a living thing?', ['Stone', 'Water', 'Mango tree', 'Air'], 2)],
    dictionary: { photosynthesis: 'How green plants make food from sunlight, water and air.', evaporation: 'When a liquid changes into a gas.', energy: 'The ability to do work or make something change.', organ: 'A part of the body with a special job, such as the heart.', matter: 'Anything that has weight and takes up space.' },
    activity: { title: 'Grow a Bean Plant', steps: ['Plant a bean seed in a cup of soil.', 'Water it a little every day and keep it near sunlight.', 'Measure and record its height every two days.', 'Draw a graph of its growth and upload it.'] },
    tutor: 'Scientists start with a question and a prediction. What do you think will happen, and how could you test it?',
    related: [{ title: 'How Plants Make Food', meta: 'Video • 6 min', kind: 'video' }, { title: 'Science Experiment Sheet', meta: 'Worksheet • 2 pages', kind: 'doc' }, { title: 'The Human Body', meta: 'Article • 5 pages (PDF)', kind: 'pdf' }],
  },
  'Social Studies': {
    about: 'Uganda, East Africa, maps, people and how we live together, for Primary 6.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Okumanya ensi yaffe kutuyamba okugikuuma n’okugyagala.' },
      { language: 'Kiswahili', text: 'Kuijua nchi yetu kunatusaidia kuilinda na kuipenda.' },
      { language: 'French', text: 'Connaître notre pays nous aide à le protéger et à l’aimer.' },
    ],
    units: [
      { title: 'Our Country', chapters: [ch('Location of Uganda', 'Uganda is a landlocked country in East Africa, crossed by the Equator.', 'Maps help us find and describe places.', ['Neighbouring countries', 'The Equator', 'Using a compass']), ch('Physical Features', 'Uganda has lakes, rivers, mountains and plateaus that shape how people live.', 'Physical features affect climate, farming and settlement.', ['Lake Victoria', 'River Nile', 'Mount Rwenzori'])] },
      { title: 'People and Leadership', chapters: [ch('People and Culture', 'Uganda has many ethnic groups with different languages, foods and traditions.', 'Respecting other cultures helps us live in peace.', ['Ethnic groups', 'Languages', 'Traditions']), ch('Government and Citizenship', 'Leaders are chosen to serve the people; good citizens obey laws and help others.', 'Every citizen has rights and responsibilities.', ['Local councils', 'Parliament', 'Children’s rights'])] },
    ],
    quiz: [q('q1', 'Uganda is in which part of Africa?', ['West', 'North', 'East', 'South'], 2), q('q2', 'The longest river in Africa is the…', ['Congo', 'Nile', 'Niger', 'Zambezi'], 1), q('q3', 'A country without a coastline is…', ['Island', 'Landlocked', 'Peninsula', 'Coastal'], 1), q('q4', 'Laws are made by…', ['Parliament', 'Teachers', 'Traders', 'Farmers'], 0), q('q5', 'Which is a children’s right?', ['Driving', 'Education', 'Voting', 'Owning land'], 1)],
    dictionary: { landlocked: 'Having no coastline on a sea or ocean.', equator: 'An imaginary line round the middle of the Earth.', culture: 'The way of life of a group of people.', citizen: 'A person who belongs to a country.', plateau: 'A large area of high, flat land.' },
    activity: { title: 'Draw a Map of Your District', steps: ['Draw your district and mark your school and home.', 'Add a key and a compass rose.', 'Mark one river, road or hill near you.', 'Upload a photo of your map.'] },
    tutor: 'Look at the map first: find the compass, the key and the scale. Then describe the place using north, south, east and west.',
    related: [{ title: 'Regions of Uganda', meta: 'Video • 8 min', kind: 'video' }, { title: 'Map Skills Worksheet', meta: 'Worksheet • 2 pages', kind: 'doc' }, { title: 'East African Community', meta: 'Article • 4 pages (PDF)', kind: 'pdf' }],
  },
  ICT: {
    about: 'computers, the internet, coding and staying safe online, for Primary 6.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Kozesa kompyuta mu ngeri ey’obukuumi era ey’amagezi.' },
      { language: 'Kiswahili', text: 'Tumia kompyuta kwa usalama na kwa busara.' },
      { language: 'French', text: 'Utilise l’ordinateur de façon sûre et intelligente.' },
    ],
    units: [
      { title: 'Using Computers', chapters: [ch('Parts of a Computer', 'A computer has input, processing, output and storage devices.', 'Computers take input, process it and give output.', ['Keyboard and mouse', 'CPU', 'Monitor and printer']), ch('Files and Documents', 'Create, save and organise documents in folders.', 'Save your work often and give files clear names.', ['Typing a document', 'Saving and folders', 'Printing'])] },
      { title: 'Coding and Safety', chapters: [ch('Introduction to Coding', 'Code is a set of instructions; computers follow them in order.', 'An algorithm is a list of steps to solve a problem.', ['Algorithms', 'Sequences', 'Loops']), ch('Staying Safe Online', 'Keep personal information private and tell an adult if something feels wrong.', 'Think before you click, share or post.', ['Strong passwords', 'Private information', 'Kindness online'])] },
    ],
    quiz: [q('q1', 'Which is an input device?', ['Monitor', 'Printer', 'Keyboard', 'Speaker'], 2), q('q2', 'A list of steps to solve a problem is…', ['A file', 'An algorithm', 'A folder', 'A mouse'], 1), q('q3', 'A strong password is…', ['123456', 'Your name', 'A mix of letters, numbers and symbols', 'password'], 2), q('q4', 'Where should you save files?', ['In clear folders', 'Anywhere', 'On the desktop only', 'Nowhere'], 0), q('q5', 'If something online upsets you…', ['Keep it secret', 'Tell a trusted adult', 'Share it', 'Reply angrily'], 1)],
    dictionary: { algorithm: 'A list of steps to solve a problem.', input: 'Information put into a computer.', output: 'Information a computer gives out.', password: 'A secret word that protects an account.', loop: 'Instructions repeated in a program.' },
    activity: { title: 'Write an Algorithm', steps: ['Write the steps to make a cup of tea.', 'Number each step in order.', 'Ask a friend to follow it exactly. Did it work?', 'Fix any missing steps and upload your algorithm.'] },
    tutor: 'Think like a computer: what is the very first step? Write each instruction clearly, one at a time.',
    related: [{ title: 'What Is Coding?', meta: 'Video • 5 min', kind: 'video' }, { title: 'Keyboard Skills', meta: 'Worksheet • 2 pages', kind: 'doc' }, { title: 'Online Safety Rules', meta: 'Article • 3 pages (PDF)', kind: 'pdf' }],
  },
  'Religious Education': {
    about: 'faith, values and caring for others, with stories and reflections for Primary 6.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Yagala muliraanwa wo nga bw’oyagala ggwe wennyini.' },
      { language: 'Kiswahili', text: 'Mpende jirani yako kama unavyojipenda mwenyewe.' },
      { language: 'French', text: 'Aime ton prochain comme toi-même.' },
    ],
    units: [
      { title: 'God’s Creation', chapters: [ch('Creation and Care', 'God created the world and gave people the duty to care for it.', 'We are stewards of God’s creation.', ['The story of creation', 'Caring for nature', 'Thankfulness']), ch('Prayer and Worship', 'People pray to praise God, give thanks and ask for help.', 'Prayer is talking with God.', ['Kinds of prayer', 'Places of worship', 'Worship songs'])] },
      { title: 'Living Together', chapters: [ch('Love and Forgiveness', 'Stories teach us to love others and forgive those who wrong us.', 'Forgiveness brings peace to families and communities.', ['The Good Samaritan', 'The lost son', 'Making peace']), ch('Good Values', 'Honesty, respect and kindness help us live well with others.', 'Good values show in what we do every day.', ['Honesty', 'Respect', 'Helping others'])] },
    ],
    quiz: [q('q1', 'Who helped the injured man in the parable?', ['The priest', 'The Levite', 'The Samaritan', 'The innkeeper'], 2), q('q2', 'Prayer is…', ['Talking with God', 'Playing', 'Sleeping', 'Shopping'], 0), q('q3', 'A steward is someone who…', ['Destroys', 'Takes care of things', 'Sells things', 'Hides things'], 1), q('q4', 'Which is a good value?', ['Lying', 'Honesty', 'Stealing', 'Fighting'], 1), q('q5', 'Forgiveness brings…', ['Anger', 'Peace', 'Fear', 'Hunger'], 1)],
    dictionary: { parable: 'A short story that teaches a lesson.', worship: 'Showing love and respect to God.', forgiveness: 'Choosing to stop being angry with someone who wronged you.', steward: 'A person who takes care of something for someone else.', honesty: 'Telling the truth and being fair.' },
    activity: { title: 'A Week of Kindness', steps: ['Do one kind act for someone each day this week.', 'Write what you did and how it made them feel.', 'Share one story with your class.', 'Upload your kindness diary.'] },
    tutor: 'Think about what the story teaches. How could you live out that lesson at home or at school this week?',
    related: [{ title: 'The Good Samaritan', meta: 'Video • 6 min', kind: 'video' }, { title: 'Values Reflection Sheet', meta: 'Worksheet • 2 pages', kind: 'doc' }, { title: 'Prayers for Children', meta: 'Article • 3 pages (PDF)', kind: 'pdf' }],
  },
  'Life Skills': {
    about: 'health, money, emotions and everyday decisions, with practical activities for Primary 6.',
    keyIdeaTranslations: [
      { language: 'Luganda', text: 'Okusalawo obulungi kutandika n’okulowooza ku bivaamu.' },
      { language: 'Kiswahili', text: 'Uamuzi mzuri huanza kwa kufikiria matokeo.' },
      { language: 'French', text: 'Une bonne décision commence par penser aux conséquences.' },
    ],
    units: [
      { title: 'Health and Wellbeing', chapters: [ch('Healthy Habits', 'Washing hands, eating a balanced diet and sleeping well keep us healthy.', 'Small daily habits protect our health.', ['Hand washing', 'Balanced diet', 'Rest and exercise']), ch('Feelings and Friendships', 'Name your feelings, listen to others and solve problems calmly.', 'Talking about feelings helps us and our friends.', ['Naming feelings', 'Listening', 'Solving conflicts'])] },
      { title: 'Everyday Skills', chapters: [ch('Money and Saving', 'Plan how to spend, save and share the money you have.', 'Save a little every time you get money.', ['Needs and wants', 'Saving', 'Simple budget']), ch('Making Decisions', 'Think about the choices and their results before you decide.', 'Stop, think, then choose.', ['Options', 'Consequences', 'Asking for help'])] },
    ],
    quiz: [q('q1', 'When should you wash your hands?', ['Before eating', 'Never', 'Only at night', 'Once a week'], 0), q('q2', 'Food is a…', ['Want', 'Need', 'Toy', 'Game'], 1), q('q3', 'A good way to solve a quarrel is…', ['Shouting', 'Talking calmly', 'Fighting', 'Ignoring forever'], 1), q('q4', 'Saving money means…', ['Spending it all', 'Keeping some for later', 'Losing it', 'Hiding it from parents'], 1), q('q5', 'Before a big decision you should…', ['Think about the results', 'Rush', 'Copy friends', 'Guess'], 0)],
    dictionary: { budget: 'A plan for how to spend and save money.', habit: 'Something you do often, almost without thinking.', consequence: 'What happens because of a choice.', balanced: 'Having the right amount of each kind.', conflict: 'A disagreement between people.' },
    activity: { title: 'Make a Savings Plan', steps: ['List three things you want and what they cost.', 'Decide how much you can save each week.', 'Work out how many weeks it will take.', 'Share your plan with a parent and upload it.'] },
    tutor: 'Try the three steps: stop, think about your choices and their results, then choose the best one. Who could you ask for advice?',
    related: [{ title: 'Healthy Habits for Kids', meta: 'Video • 5 min', kind: 'video' }, { title: 'My Feelings Chart', meta: 'Worksheet • 1 page', kind: 'doc' }, { title: 'Saving Money', meta: 'Article • 3 pages (PDF)', kind: 'pdf' }],
  },
};

/** Books on one topic: their own chapter titles, two to a unit. Subject textbooks use the subject outline. */
export const bookTopics: Readonly<Record<string, readonly string[]>> = {
  'animal-world': ['Mammals', 'Birds and Reptiles', 'Insects', 'Animals of Uganda'],
  fractions: ['What Is a Fraction?', 'Equivalent Fractions', 'Decimals', 'Fractions in Everyday Life'],
  'solar-system': ['The Sun', 'The Planets', 'The Moon', 'Exploring Space'],
  'coding-kids': ['What Is Code?', 'Sequences and Loops', 'Making Decisions', 'Build a Simple Game'],
  'child-story': ['Morning in the Village', 'The Journey to School', 'A Difficult Day', 'Home Again'],
  'healthy-habits': ['Clean Hands', 'Eating Well', 'Rest and Exercise', 'Keeping Our Homes Clean'],
  'maps-world': ['Reading a Map', 'Continents and Oceans', 'Map of Uganda', 'Using a Compass'],
  'christian-values': ['Love', 'Honesty', 'Forgiveness', 'Serving Others'],
  'simple-machines': ['Levers', 'Pulleys', 'Wheels and Axles', 'Inclined Planes'],
  'climate-change': ['Weather and Climate', 'Why the Climate Is Changing', 'Effects in Uganda', 'What We Can Do'],
  'creative-writing': ['Finding Ideas', 'Planning a Story', 'Describing with Words', 'Editing Your Work'],
  'money-me': ['Needs and Wants', 'Earning Money', 'Saving', 'Making a Budget'],
  'digital-safety': ['Personal Information', 'Strong Passwords', 'Being Kind Online', 'Getting Help'],
  'uganda-stories': ['The Clever Hare', 'Why the Sun and Moon Live in the Sky', 'The Greedy Lion', 'The Gift of the Nile'],
  'science-home': ['Floating and Sinking', 'Mixing Colours', 'Growing Seeds', 'Making a Water Filter'],
  'model-essays': ['A Day I Will Never Forget', 'My Best Friend', 'The Importance of Education', 'Comprehension Practice'],
  'ple-top100': ['Numbers and Place Value', 'Fractions and Decimals', 'Measurement', 'Geometry and Graphs'],
  'bible-stories': ['Creation', 'Noah and the Ark', 'David and Goliath', 'Jesus Feeds Five Thousand'],
  'uganda-pictures': ['Our Lakes and Rivers', 'National Parks', 'Our Cities', 'Culture and Celebrations'],
  'project-ideas': ['Choosing a Project', 'Planning and Research', 'Building and Testing', 'Presenting Your Work'],
  'p6-revision': ['Mathematics Revision', 'English Revision', 'Science Revision', 'Social Studies Revision'],
  'water-cycle': ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
  'reading-comp': ['Finding the Main Idea', 'Reading for Detail', 'New Words', 'Answering Questions'],
  'maths-olevel': ['Number Bases', 'Algebra', 'Geometry', 'Statistics'],
};
