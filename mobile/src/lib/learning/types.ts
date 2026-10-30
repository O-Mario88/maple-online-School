import type { components } from '@/lib/api/schema';

type Schemas = components['schemas'];

export type Assessment = Schemas['Assessment'];
export type Submission = Schemas['Submission'];
export type Grade = Schemas['Grade'];
export type NewAssessment = Schemas['NewAssessment'];
