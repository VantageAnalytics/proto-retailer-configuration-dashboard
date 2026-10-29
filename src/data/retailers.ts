import type { Program, Retailer } from '../types';

export const retailers: Retailer[] = [
  { id: 'advantage-grocery', name: 'Advantage Grocery', code: 'ADVANTAGE_GROCERY' },
  { id: 'fresh-foods', name: 'Fresh Foods Co', code: 'FRESH_FOODS' },
];

export const programs: Program[] = [
  {
    id: 'advantage-grocery',
    name: 'Advantage Grocery',
    code: 'ADVANTAGE_GROCERY',
    retailerIds: ['advantage-grocery', 'fresh-foods'],
  },
  {
    id: 'metro-hardware',
    name: 'Metro Hardware',
    code: 'METRO_HARDWARE',
    retailerIds: ['advantage-grocery', 'fresh-foods'],
  },
  {
    id: 'coastal-pharmacy',
    name: 'Coastal Pharmacy',
    code: 'COASTAL_PHARMACY',
    retailerIds: ['advantage-grocery', 'fresh-foods'],
  },
];

export const defaultProgramId = 'advantage-grocery';
export const defaultRetailerId = 'advantage-grocery';

/** Seeded as a complete setup so the Live state can be demoed beside the default retailer's Pending state. */
export const completeSetupRetailerId = 'fresh-foods';

export function retailersForProgram(programId: string): Retailer[] {
  const program = programs.find((p) => p.id === programId);
  return retailers.filter((retailer) => program?.retailerIds.includes(retailer.id));
}
