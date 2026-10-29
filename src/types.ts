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
  /** Shown when available is false, in place of the card internals. */
  unavailableReason?: string;
}

/** A Retailer global settings section. Settings only, no feature flags. */
export interface GlobalSection {
  id: string;
  name: string;
  description: string;
  configs: ConfigField[];
}

interface ChangeEventBase {
  id: string;
  capabilityId: string;
  /** Whoever performed this action: the requester, the approver, or the note's author. */
  actor: string;
  timestamp: string;
}

/**
 * One action taken against a setting or feature flag. Requesting a change and ruling
 * on it are separate entries, since they are done by different people at different times.
 */
export interface SettingChangeEvent extends ChangeEventBase {
  kind: 'change';
  settingKey: string;
  settingLabel: string;
  from: string;
  to: string;
  status: 'applied' | 'pending' | 'declined';
  /** Why the change was asked for, or what came of it. */
  reason?: string;
  source: Source;
}

/** Free-text context left on a card, not tied to any one setting. */
export interface NoteEvent extends ChangeEventBase {
  kind: 'note';
  body: string;
}

export type ChangeEvent = SettingChangeEvent | NoteEvent;

export interface Retailer {
  id: string;
  name: string;
  /** Platform identifier shown beside the name, e.g. ADVANTAGE_GROCERY. */
  code: string;
}

/** A Retail Media Program: the top-level tenant that retailers run under. */
export interface Program {
  id: string;
  name: string;
  code: string;
  retailerIds: string[];
}

/** A config field a use case sets, with the value it proposes. */
export interface UseCaseField {
  /** Capability or Retailer global settings section the field belongs to. */
  ownerId: string;
  key: string;
  /** Omitted to keep the retailer's current value; a function derives it from the retailer and that value. */
  value?: ConfigField['value'] | ((retailer: Retailer, current: ConfigField['value']) => ConfigField['value']);
}

/** A preset bundle of features and settings for a common retailer setup. */
export interface UseCase {
  id: string;
  name: string;
  description: string;
  /** Feature flags the use case turns on, as owner ID and feature key. */
  features: { ownerId: string; key: string }[];
  globalFields: UseCaseField[];
  channelFields: UseCaseField[];
}

export interface Person {
  name: string;
  role: string;
}
