import type { Retailer } from '../types';

export const retailers: Retailer[] = [
  { id: 'ulta', name: 'Ulta' },
  { id: 'thd-us', name: 'The Home Depot US' },
  { id: 'thd-ca', name: 'The Home Depot CA' },
  { id: 'canadian-tire', name: 'Canadian Tire' },
  { id: 'marks', name: "Mark's" },
  { id: 'sport-chek', name: 'Sport Chek' },
];

export const defaultRetailerId = 'ulta';
