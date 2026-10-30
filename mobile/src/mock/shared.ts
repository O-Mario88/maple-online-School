/** Fixtures for screens that open over any portal (design builds only; never bundled in deployment). */

export const copilot = {
  context: 'S3 Mathematics · Quadratic equations',
  suggestions: ['Explain factorising step by step', 'Give me 3 practice questions', 'Where did I go wrong in question 4?'],
  conversation: [
    { from: 'learner', text: 'How do I solve x² − 5x + 6 = 0?' },
    { from: 'maple', text: 'Look for two numbers that multiply to 6 and add to −5. Which pair works?' },
    { from: 'learner', text: '−2 and −3?' },
    { from: 'maple', text: 'Yes. So (x − 2)(x − 3) = 0, which means x = 2 or x = 3. Want to try one on your own?' },
  ],
  note: 'Maple guides you to the answer rather than giving it. Teachers can see what you asked.',
};

export const sync = {
  online: false,
  waiting: 3,
  lastSynced: 'Today 07:42',
};

export const concern = {
  kinds: ['Someone made me feel unsafe', 'Bullying or unkind messages', 'Wrong or harmful content', 'Payment problem', 'Something else'],
  promise: 'A trained person reads every report within 24 hours. Safety reports go to the front of the queue.',
};

export const checkout = {
  item: 'UCE Mathematics: Quadratics Mastery',
  seller: 'Mr. Daniel Ssempala',
  priceUGX: 45000,
  walletUGX: 12000,
  methods: ['MTN MoMo', 'Airtel Money', 'Card', 'Maple wallet'],
  guarantee: 'Your money is held until the lessons are delivered. Full refund within 7 days if you change your mind.',
};
