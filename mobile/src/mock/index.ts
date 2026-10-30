/**
 * Every fixture for design builds. Only lib/mock.ts loads this, and only when
 * EXPO_PUBLIC_MOCK_DATA=true, so a deployment build never contains it.
 */
import * as command from './command';
import * as family from './family';
import * as learner from './learner';
import * as publicPages from './public';
import * as school from './school';
import * as shared from './shared';
import * as teacher from './teacher';

// Searched for in deployment bundles to prove the fixtures were left out.
export const MOCK_SENTINEL = 'maple-mock-fixtures-v1';

export const mock = { learner, teacher, family, school, command, publicPages, shared, sentinel: MOCK_SENTINEL };

export type MockData = typeof mock;
