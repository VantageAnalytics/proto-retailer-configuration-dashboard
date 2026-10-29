import { useState } from 'react';
import { Box, Collapse, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { cardShadow, palette } from '../theme';
import { computeCapabilityStatus, summaryLine } from '../logic/status';
import { configGroups } from '../data/capabilities';
import { CardChangeHistory } from './ChangeHistoryPanel';
import { ConfigFieldGroup } from './ConfigFieldGroup';
import { type ConfigValue } from './ConfigFieldRow';
import { StateToggle } from './StateToggle';
import {
  Banner,
  Chip,
  ErrorPill,
  InfoTooltip,
  PendingPill,
  SectionHeading,
  StatusPill,
  SuccessPill,
  TextAction,
  UnsavedBar,
} from './ui';
import type { Capability, ChangeEvent, Feature } from '../types';

export interface Draft {
  features: Record<string, boolean>;
  configs: Record<string, ConfigValue>;
}

export const emptyDraft: Draft = { features: {}, configs: {} };

interface Props {
  capability: Capability;
  /** Change history for this capability only. */
  events: ChangeEvent[];
  expanded: boolean;
  onToggleExpanded: () => void;
  draft: Draft;
  onFeatureChange: (key: string, next: boolean) => void;
  onConfigChange: (key: string, next: ConfigValue) => void;
  onSave: () => void;
  onDiscard: () => void;
  onAddNote: (body: string) => void;
  registerFieldRef: (key: string, node: HTMLElement | null) => void;
  cardRef: (node: HTMLDivElement | null) => void;
  /** false pins the card open with no chevron, for the card layout's single expanded view. */
  collapsible?: boolean;
  /** false drops the history rail when the page shows history in its own section. */
  showHistory?: boolean;
}

function SubSectionHeader({ title }: { title: string }) {
  return (
    <Box sx={{ borderBottom: `1px solid ${palette.border}`, pb: 1 }}>
      <Typography variant="h3" sx={{ fontWeight: 600, color: palette.textSecondary }}>
        {title}
      </Typography>
    </Box>
  );
}

function FeatureRow({
  feature,
  draftValue,
  disabled,
  disabledReason,
  onChange,
  onRequestAgain,
  required,
}: {
  feature: Feature;
  draftValue: boolean | undefined;
  disabled: boolean;
  disabledReason?: string;
  onChange: (next: boolean) => void;
  onRequestAgain: () => void;
  /** The master feature carries a Required chip in place of its description. */
  required?: boolean;
}) {
  const unsaved = draftValue !== undefined;
  const effectiveState: Feature['state'] = unsaved
    ? draftValue
      ? 'live'
      : 'off'
    : feature.state;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <StateToggle
        state={effectiveState}
        ariaLabel={feature.label}
        disabled={disabled}
        disabledReason={disabledReason}
        onChange={onChange}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {feature.label}
          </Typography>
          {required && <Chip>Required</Chip>}
          {unsaved && <Chip tone="info">Unsaved</Chip>}
          {!unsaved && feature.state === 'pending' && <PendingPill />}
          {!unsaved && feature.state === 'live' && <SuccessPill>Live</SuccessPill>}
          {!unsaved && feature.state === 'declined' && <ErrorPill>Declined</ErrorPill>}
        </Box>
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
          {feature.description}
        </Typography>
        {!unsaved && feature.state === 'declined' && (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ color: palette.errorText }}>
              Declined by {feature.declinedBy}: {feature.declinedReason}
            </Typography>
            <TextAction icon={faRotateRight} onClick={onRequestAgain}>
              Request again
            </TextAction>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function CapabilityCard(props: Props) {
  const {
    capability,
    events,
    expanded,
    onToggleExpanded,
    draft,
    onFeatureChange,
    onConfigChange,
    onSave,
    onDiscard,
    onAddNote,
    registerFieldRef,
    cardRef,
    collapsible = true,
    showHistory = true,
  } = props;

  const [historyCollapsed, setHistoryCollapsed] = useState(false);

  const { status, reasons } = computeCapabilityStatus(capability);
  const unsavedCount = Object.keys(draft.features).length + Object.keys(draft.configs).length;

  const master = capability.features.find((f) => f.key === capability.masterFeatureKey);
  const masterDraft = master ? draft.features[master.key] : undefined;
  const masterOn = masterDraft !== undefined ? masterDraft : master?.state === 'live' || master?.state === 'pending';

  const expandable = collapsible && (capability.available || Boolean(capability.unavailableReason));

  const header = (
    <Box
      component={collapsible ? 'button' : 'div'}
      type={collapsible ? 'button' : undefined}
      onClick={expandable ? onToggleExpanded : undefined}
      disabled={collapsible ? !expandable : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        background: 'none',
        border: 'none',
        p: 0,
        font: 'inherit',
        textAlign: 'left',
        cursor: expandable ? 'pointer' : 'default',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h2">{capability.name}</Typography>
          <StatusPill status={status} />
        </Box>
        {capability.subtitle && (
          <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
            {capability.subtitle}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
          {summaryLine(capability)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {!capability.available && (
          <StateToggle state="off" ariaLabel={capability.name} disabled presentational />
        )}
        {expandable && <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} style={{ fontSize: 16 }} />}
      </Box>
    </Box>
  );

  return (
    <Box
      ref={cardRef}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: cardShadow,
        p: 3,
        scrollMarginTop: 24,
      }}
    >
      {header}

      {!capability.available && capability.unavailableReason && (
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Banner kind="info">{capability.unavailableReason}</Banner>
          </Box>
        </Collapse>
      )}

      {capability.detailed && (
        <Collapse in={expanded} unmountOnExit>
          {/* Full-bleed rule separating the card header from its body. */}
          <Divider sx={{ mt: 2, mx: -3 }} />
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Section A: Features */}
            <Box>
              <SubSectionHeader title="Features" />
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {master && (
                  <FeatureRow
                    feature={master}
                    draftValue={draft.features[master.key]}
                    disabled={false}
                    required
                    onChange={(next) => onFeatureChange(master.key, next)}
                    onRequestAgain={() => onFeatureChange(master.key, true)}
                  />
                )}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    columnGap: 3,
                    rowGap: 1.5,
                  }}
                >
                  {capability.features
                    .filter((f) => f.prerequisiteKey)
                    .map((feature) => (
                      <FeatureRow
                        key={feature.key}
                        feature={feature}
                        draftValue={draft.features[feature.key]}
                        disabled={!masterOn}
                        disabledReason={master ? `Requires ${master.label} to be on` : undefined}
                        onChange={(next) => onFeatureChange(feature.key, next)}
                        onRequestAgain={() => onFeatureChange(feature.key, true)}
                      />
                    ))}
                </Box>
              </Box>
            </Box>

            {/* Section B: Configuration.
                Conflict with the LLM Design Guidelines: they call for complex modules to show a
                summary state with an Edit button that opens a modal. The build brief's scaffold
                takes precedence for page structure, so this is inline editing instead. */}
            <Box>
              <SubSectionHeader title="Configuration" />
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {configGroups(capability.configs).map((group) => {
                  const fields = capability.configs.filter((c) => c.group === group);
                  if (fields.length === 0) return null;
                  return (
                    <Box key={group}>
                      <SectionHeading>{group}</SectionHeading>
                      <Box sx={{ mt: 1.5 }}>
                        <ConfigFieldGroup
                          fields={fields}
                          draftConfigs={draft.configs}
                          onChange={onConfigChange}
                          registerFieldRef={registerFieldRef}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Section C: Built in code */}
            {capability.codeNotes.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                {capability.codeNotes.map((note) => (
                  <Box key={note} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: palette.textSecondary }}>
                      {note}
                    </Typography>
                    <InfoTooltip title="This behaviour is defined in code and can't be configured here." />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

            {showHistory && (
              <CardChangeHistory
                events={events}
                collapsed={historyCollapsed}
                onToggleCollapsed={() => setHistoryCollapsed(!historyCollapsed)}
                onAddNote={onAddNote}
              />
            )}
          </Box>

          {unsavedCount > 0 && <UnsavedBar count={unsavedCount} onDiscard={onDiscard} onSave={onSave} />}
        </Collapse>
      )}

      {status === 'incomplete' && reasons.length > 0 && !expanded && (
        <Box sx={{ mt: 2 }}>
          <Banner kind="warning">Incomplete: {reasons.join(', ')}.</Banner>
        </Box>
      )}
    </Box>
  );
}
