import type { Capability, CapabilityStatus, ConfigField } from '../types';

export interface StatusResult {
  status: CapabilityStatus;
  /** Why the card is Incomplete. Empty for every other status. */
  reasons: string[];
}

export function isEmptyValue(value: ConfigField['value']): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Headline status for a capability card. Computed, never stored, so the rules
 * can change in one place.
 */
export function computeCapabilityStatus(capability: Capability): StatusResult {
  if (!capability.available) return { status: 'unavailable', reasons: [] };

  const master = capability.features.find((f) => f.key === capability.masterFeatureKey);

  if (!master || master.state === 'off') return { status: 'off', reasons: [] };
  if (master.state === 'pending') return { status: 'pending', reasons: [] };
  if (master.state === 'declined') return { status: 'declined', reasons: [] };

  const reasons: string[] = [];
  const emptyBlockingKeys = new Set(
    capability.configs
      .filter((f) => f.required === 'BlocksPublishing' && isEmptyValue(f.value))
      .map((f) => f.key),
  );

  for (const check of capability.prerequisites) {
    if (check.key === capability.masterFeatureKey + '-toggle') continue;
    // A check backed by an empty blocking field is reported once, as the field.
    if (check.fixesFieldKey && emptyBlockingKeys.has(check.fixesFieldKey)) continue;
    if (!check.passed && !check.pending) reasons.push(check.label);
  }

  for (const field of capability.configs) {
    if (emptyBlockingKeys.has(field.key)) reasons.push(`${field.label} is empty`);
  }

  if (reasons.length > 0) return { status: 'incomplete', reasons };
  return { status: 'live', reasons: [] };
}

/** The dot shown next to each left-nav item. */
export function navDotStatus(capability: Capability): CapabilityStatus {
  return computeCapabilityStatus(capability).status;
}

export function countPending(capability: Capability): number {
  const toggles = capability.features.filter((f) => f.state === 'pending').length;
  const fields = capability.configs.filter((c) => c.state === 'pending').length;
  return toggles + fields;
}

/** Collapsed-card summary line, e.g. "3 features · 1 pending". */
export function summaryLine(capability: Capability): string {
  if (!capability.available) return 'Not available for this program';
  const parts = [`${capability.features.length} feature${capability.features.length === 1 ? '' : 's'}`];
  const pending = countPending(capability);
  if (pending > 0) parts.push(`${pending} pending`);
  return parts.join(' · ');
}
