export type Source = 'LaunchDarkly' | 'AppConfig' | 'Database' | 'Code';
export type RequiredLevel = 'BlocksPublishing' | 'BreaksFeature' | 'Optional';
export type ToggleState = 'off' | 'pending' | 'live' | 'declined';

export type FieldState = 'saved' | 'pending' | 'declined';
export type InputType = 'text' | 'select' | 'multiselect' | 'toggle';

/** Headline status for a capability card, computed rather than stored. */
export type CapabilityStatus =
  | 'off'
  | 'pending'
  | 'declined'
  | 'incomplete'
  | 'live'
  | 'unavailable';

export interface Feature {
  key: string;
  label: string;
  state: ToggleState;
  /** Dependent flags point at their prerequisite. */
  prerequisiteKey?: string;
  description: string;
  declinedBy?: string;
  declinedReason?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  /** "Builder" | "Defaults" | "Accounts" */
  group: string;
  inputType: InputType;
  options?: string[];
  value: string | string[] | boolean | null;
  state: FieldState;
  source: Source;
  required: RequiredLevel;
  description: string;
  declinedBy?: string;
  declinedReason?: string;
}

export interface PrerequisiteCheck {
  key: string;
  label: string;
  passed: boolean;
  /** Set when the check is neither passing nor failing, e.g. awaiting approval. */
  pending?: boolean;
  source: Source;
  explanation: string;
  /** Config field this check is fixed by, when the field lives on this card. */
  fixesFieldKey?: string;
  /** Retailer global settings section this check is fixed in, when it lives elsewhere. */
  fixesGlobalSection?: string;
}

export interface Capability {
  id: string;
  name: string;
  subtitle?: string;
  navGroup: string;
  /** false for Reddit: the capability exists for every program but isn't offered yet. */
  available: boolean;
  /** Some capabilities have no single master feature. */
  masterFeatureKey?: string;
  features: Feature[];
  configs: ConfigField[];
  prerequisites: PrerequisiteCheck[];
  codeNotes: string[];
  /** Placeholder cards show "Details in next iteration" instead of card internals. */
  detailed: boolean;
}

export interface ChangeEvent {
  id: string;
  capabilityId: string;
  settingKey: string;
  settingLabel: string;
  from: string;
  to: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'applied' | 'pending' | 'declined';
  reason?: string;
  source: Source;
  timestamp: string;
}

export interface Retailer {
  id: string;
  name: string;
}

export interface Person {
  name: string;
  role: string;
}
