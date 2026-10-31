import type { components } from '@/lib/api/schema';

type Schemas = components['schemas'];

export type Class = Schemas['Class'];
export type Roster = Schemas['Roster'];
export type Mark = Schemas['Mark'];
export type MarkStatus = Schemas['MarkStatus'];
export type RegisterRequest = Schemas['RegisterRequest'];
