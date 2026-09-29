import type { Person } from '../types';

export const people: Person[] = [
  { name: 'Priya Raman', role: 'Solutions Engineer' },
  { name: 'Marcus Delgado', role: 'Technical Account Manager' },
  { name: 'Hannah Cho', role: 'Support Lead' },
  { name: 'Owen Fitzgerald', role: 'Engineering Manager' },
  { name: 'Sofia Brennan', role: 'Product Manager' },
  { name: 'Daniel Okafor', role: 'Account Manager' },
];

/** The logged-in prototype user: changes made during the demo are attributed to her. */
export const currentUser: Person = people[0];
