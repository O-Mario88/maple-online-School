/**
 * Every fixture for design builds. Only lib/mock.ts loads this, and only when
 * EXPO_PUBLIC_MOCK_DATA=true, so a deployment build never contains it.
 */
import * as bookReader from './book-reader';
import * as command from './command';
import * as commandCenter from './command-center';
import * as family from './family';
import * as learner from './learner';
import * as portal from './portal';
import * as publicPages from './public';
import * as readerLibrary from './reader-library';
import * as school from './school';
import * as schoolAdmin from './school-admin';
import * as shared from './shared';
import * as teacher from './teacher';

// Searched for in deployment bundles to prove the fixtures were left out.
export const MOCK_SENTINEL = 'maple-mock-fixtures-v1';

export const mock = { learner, teacher, family, school, command, publicPages, shared, portal, schoolAdmin, commandCenter, bookReader, readerLibrary, sentinel: MOCK_SENTINEL };

export type MockData = typeof mock;
