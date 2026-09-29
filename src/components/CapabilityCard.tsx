import { useState } from 'react';
import { Box, Button, Collapse, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faArrowRightToBracket,
  faCheck,
  faClock,
  faRotateRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { brand, cardShadow, palette } from '../theme';
import { computeCapabilityStatus, countPending, summaryLine } from '../logic/status';
import { configGroupOrder } from '../data/capabilities';
import { ConfigFieldRow, type ConfigValue } from './ConfigFieldRow';
import { StateToggle } from './StateToggle';
import {
  Banner,
  ErrorPill,
  InfoTooltip,
  PendingPill,
  SectionHeading,
  SourceTag,
  StatusPill,
  SuccessPill,
  TextAction,
} from './ui';
import type { Capability, Feature } from '../types';

export interface Draft {
  features: Record<string, boolean>;
  configs: Record<string, ConfigValue>;
}

export const emptyDraft: Draft = { features: {}, configs: {} };

interface Props {
  capability: Capability;
  expanded: boolean;
  onToggleExpanded: () => void;
  draft: Draft;
  onFeatureChange: (key: string, next: boolean) => void;
  onConfigChange: (key: string, next: ConfigValue) => void;
  onSave: () => void;
  onDiscard: () => void;
  onGoToGlobalSection: (sectionId: string) => void;
  registerFieldRef: (key: string, node: HTMLElement | null) => void;
  focusField: (key: string) => void;
  cardRef: (node: HTMLDivElement | null) => void;
}

function SubSectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${palette.textPrimary}`,
        p: 0,
        pb: 1,
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      <Typography variant="h2">{title}</Typography>
      <FontAwesomeIcon icon={open ? faAngleUp : faAngleDown} style={{ fontSize: 14 }} />
    </Box>
  );
}

function FeatureRow({
  feature,
  draftValue,
  disabled,
  onChange,
  onRequestAgain,
}: {
  feature: Feature;
  draftValue: boolean | undefined;
  disabled: boolean;
  onChange: (next: boolean) => void;
  onRequestAgain: () => void;
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
        disabledReason="Requires Meta to be on"
        onChange={onChange}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {feature.label}
          </Typography>
          {unsaved && (
            <Box
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: brand.orangeDark,
                bgcolor: brand.orangeTint,
                border: `1px solid ${brand.orangeLight}`,
                borderRadius: '8px',
                px: 1,
                py: '2px',
              }}
            >
              Unsaved
            </Box>
          )}
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
    expanded,
    onToggleExpanded,
    draft,
    onFeatureChange,
    onConfigChange,
    onSave,
    onDiscard,
    onGoToGlobalSection,
    registerFieldRef,
    focusField,
    cardRef,
  } = props;

  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);
  const [checksOpen, setChecksOpen] = useState(true);

  const { status, reasons } = computeCapabilityStatus(capability);
  const unsavedCount = Object.keys(draft.features).length + Object.keys(draft.configs).length;

  const master = capability.features.find((f) => f.key === capability.masterFeatureKey);
  const masterDraft = master ? draft.features[master.key] : undefined;
  const masterOn = masterDraft !== undefined ? masterDraft : master?.state === 'live' || master?.state === 'pending';

  const failedChecks = capability.prerequisites.filter((c) => !c.passed && !c.pending);

  const header = (
    <Box
      component="button"
      type="button"
      onClick={onToggleExpanded}
      disabled={!capability.available}
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
        cursor: capability.available ? 'pointer' : 'default',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h2" sx={{ fontSize: 16 }}>
            {capability.name}
          </Typography>
          <StatusPill status={status} />
          {countPending(capability) > 0 && status !== 'pending' && (
            <PendingPill>{countPending(capability)} pending</PendingPill>
          )}
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
        {!capability.detailed && (
          <StateToggle
            state={capability.available ? (capability.features[0]?.state ?? 'off') : 'off'}
            ariaLabel={capability.name}
            disabled
            presentational
          />
        )}
        {capability.available && (
          <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} style={{ fontSize: 16 }} />
        )}
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

      {!capability.detailed && (
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: 2 }}>
          Details in next iteration
        </Typography>
      )}

      {capability.detailed && (
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: '36px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {/* Section A: Prerequisite checks */}
            <Box>
              <SubSectionHeader
                title="Prerequisite checks"
                open={checksOpen}
                onToggle={() => setChecksOpen(!checksOpen)}
              />
              <Collapse in={checksOpen}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {failedChecks.length > 0 && (
                    <Banner kind="warning">
                      <strong>Meta won't work yet:</strong> {failedChecks.length} required setting
                      {failedChecks.length === 1 ? ' is' : 's are'} missing.{' '}
                      {failedChecks.map((c) => c.label.replace(/ is set$/, '')).join(', ')} is empty.
                    </Banner>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {capability.prerequisites.map((check) => {
                      const state = check.pending ? 'pending' : check.passed ? 'pass' : 'fail';
                      return (
                        <Box key={check.key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              mt: '2px',
                              flexShrink: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor:
                                state === 'pass'
                                  ? palette.successCircle
                                  : state === 'pending'
                                    ? palette.amber
                                    : palette.errorBg,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={state === 'pass' ? faCheck : state === 'pending' ? faClock : faXmark}
                              style={{ color: '#FFFFFF', fontSize: 9 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {check.label}
                              </Typography>
                              <SourceTag source={check.source} />
                              {state === 'pending' && <PendingPill />}
                            </Box>
                            <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block' }}>
                              {check.explanation}
                            </Typography>
                            {state === 'fail' && (
                              <Box sx={{ mt: 0.5 }}>
                                <TextAction
                                  icon={faArrowRightToBracket}
                                  onClick={() => {
                                    if (check.fixesFieldKey) focusField(check.fixesFieldKey);
                                    else if (check.fixesGlobalSection) onGoToGlobalSection(check.fixesGlobalSection);
                                  }}
                                >
                                  Go to setting
                                </TextAction>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {/* Section B: Features */}
            <Box>
              <SubSectionHeader
                title="Features"
                open={featuresOpen}
                onToggle={() => setFeaturesOpen(!featuresOpen)}
              />
              <Collapse in={featuresOpen}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {master && (
                    <FeatureRow
                      feature={master}
                      draftValue={draft.features[master.key]}
                      disabled={false}
                      onChange={(next) => onFeatureChange(master.key, next)}
                      onRequestAgain={() => onFeatureChange(master.key, true)}
                    />
                  )}
                  <Box
                    sx={{
                      pl: 4,
                      ml: 1.5,
                      borderLeft: `1px solid ${palette.border}`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      columnGap: 3,
                      rowGap: 2,
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
                          onChange={(next) => onFeatureChange(feature.key, next)}
                          onRequestAgain={() => onFeatureChange(feature.key, true)}
                        />
                      ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {/* Section C: Configuration.
                Conflict with the LLM Design Guidelines: they call for complex modules to show a
                summary state with an Edit button that opens a modal. The build brief's scaffold
                takes precedence for page structure, so this is an inline accordion with inline
                editing instead. */}
            <Box>
              <SubSectionHeader
                title="Configuration"
                open={configOpen}
                onToggle={() => setConfigOpen(!configOpen)}
              />
              <Collapse in={configOpen}>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: '36px' }}>
                  {configGroupOrder.map((group) => {
                    const fields = capability.configs.filter((c) => c.group === group);
                    if (fields.length === 0) return null;
                    return (
                      <Box key={group}>
                        <SectionHeading>{group}</SectionHeading>
                        <Box
                          sx={{
                            mt: 2,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            columnGap: 3,
                            rowGap: 3,
                          }}
                        >
                          {fields.map((field) => (
                            <ConfigFieldRow
                              key={field.key}
                              field={field}
                              draftValue={draft.configs[field.key]}
                              onChange={(next) => onConfigChange(field.key, next)}
                              onRequestAgain={() => onConfigChange(field.key, field.value)}
                              fieldRef={(node) => registerFieldRef(field.key, node)}
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>

            {/* Section D: Built in code */}
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

          {unsavedCount > 0 && (
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                mt: 3,
                mx: -3,
                mb: -3,
                px: 3,
                py: 2,
                bgcolor: brand.orangeTint,
                borderTop: `1px solid ${brand.orangeLight}`,
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {unsavedCount} unsaved change{unsavedCount === 1 ? '' : 's'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={onDiscard} sx={{ color: palette.textSecondary }}>
                  Discard
                </Button>
                <Button variant="contained" onClick={onSave}>
                  Save changes
                </Button>
              </Box>
            </Box>
          )}
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
