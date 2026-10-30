import { scoreQuiz } from './quiz';

const questions = [{ answer: 0 }, { answer: 1 }, { answer: 1 }];

describe('scoreQuiz', () => {
  it('counts the questions answered correctly', () => {
    expect(scoreQuiz(questions, [0, 1, 3])).toEqual({ correct: 2, total: 3 });
  });

  it('treats unanswered questions as wrong', () => {
    expect(scoreQuiz(questions, [0, null])).toEqual({ correct: 1, total: 3 });
  });
});
