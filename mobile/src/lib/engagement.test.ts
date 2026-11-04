import { ratingLabel, statsLine, statsSpoken } from './engagement';

describe('content stats', () => {
  test('a rating out of five, to one decimal, kept between 0 and 5', () => {
    expect(ratingLabel(4.75)).toBe('4.8');
    expect(ratingLabel(5)).toBe('5.0');
    expect(ratingLabel(7)).toBe('5.0');
    expect(ratingLabel(-1)).toBe('0.0');
  });

  test('views shortened, with the rating', () => {
    expect(statsLine({ uploader: 'Mr. James Kato', views: 12_400, rating: 4.8, likes: 900, comments: 54 })).toBe('12K views · 4.8/5');
    expect(statsLine({ uploader: 'Ms. Atim', views: 1, rating: 4, likes: 0, comments: 0 })).toBe('1 view · 4.0/5');
  });

  test('a screen reader hears every number in full, with the uploader', () => {
    expect(statsSpoken({ uploader: 'Mr. James Kato', views: 12_400, rating: 4.8, likes: 900, comments: 54 })).toBe('Uploaded by Mr. James Kato. 12,400 views, rated 4.8 out of 5, 900 likes, 54 comments');
    expect(statsSpoken({ uploader: 'Ms. Atim', views: 1, rating: 4, likes: 1, comments: 1 })).toBe('Uploaded by Ms. Atim. 1 view, rated 4.0 out of 5, 1 like, 1 comment');
  });
});
