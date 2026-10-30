import { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import { formatValue } from '../logic/status';
import type { Capability, ConfigField, Feature, GlobalSection, Retailer, UseCase, UseCaseField } from '../types';
import type { Draft } from './CapabilityCard';
import { ConfigFieldRow, type ConfigValue } from './ConfigFieldRow';
import { StateToggle } from './StateToggle';
import { PendingPill, SectionHeading, SuccessPill } from './ui';

/** Same order as a capability card: features, then their configuration, then retailer-wide prerequisites. */
const steps = ['Features', 'Channel settings', 'Global settings'] as const;

interface ResolvedFeature {
  id: string;
  ownerId: string;
  ownerName: string;
  feature: Feature;
  alreadyOn: boolean;
}

interface ResolvedField {
  id: string;
  ownerId: string;
  ownerName: string;
  field: ConfigField;
  proposed: ConfigValue;
}

function groupBy<T extends { ownerName: string }>(items: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(item.ownerName, [...(groups.get(item.ownerName) ?? []), item]);
  return [...groups];
}

function StepIndicator({ current }: { current: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: index < steps.length - 1 ? 1 : 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  bgcolor: done ? brand.periwinkleDark : active ? brand.periwinkleTint : palette.pillBg,
                  color: done ? '#FFFFFF' : active ? brand.periwinkleDark : palette.textSecondary,
                  border: `1px solid ${done || active ? brand.periwinkleDark : palette.border}`,
                }}
              >
                {done ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} /> : index + 1}
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: active ? 700 : 400, color: active || done ? 'text.primary' : palette.textSecondary, whiteSpace: 'nowrap' }}
              >
                {label}
              </Typography>
            </Box>
            {index < steps.length - 1 && (
              <Box sx={{ flex: 1, height: '1px', bgcolor: done ? brand.periwinkleDark : palette.border }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function StepIntro({ title, children }: { title: string; children: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2" sx={{ color: palette.textSecondary, mt: '2px' }}>
        {children}
      </Typography>
    </Box>
  );
}

function EmptyStep({ children }: { children: string }) {
  return (
    <Typography variant="body2" sx={{ color: palette.textSecondary }}>
      {children}
    </Typography>
  );
}

/**
 * Walks through the features and settings a use case sets for one retailer. Features left on
 * and settings whose value differs from today are sent for approval.
 */
export function UseCaseWizard({
  useCase,
  retailer,
  capabilities,
  sections,
  onCancel,
  onSubmit,
}: {
  useCase: UseCase;
  retailer: Retailer;
  capabilities: Capability[];
  sections: GlobalSection[];
  onCancel: () => void;
  onSubmit: (drafts: Record<string, Draft>) => void;
}) {
  const features: ResolvedFeature[] = useMemo(
    () =>
      useCase.features.flatMap(({ ownerId, key }) => {
        const capability = capabilities.find((c) => c.id === ownerId);
        const feature = capability?.available ? capability.features.find((f) => f.key === key) : undefined;
        if (!capability || !feature) return [];
        const alreadyOn = feature.state === 'live' || feature.state === 'pending';
        return [{ id: `${ownerId}:${key}`, ownerId, ownerName: capability.name, feature, alreadyOn }];
      }),
    [useCase, capabilities],
  );

  const resolveFields = (fields: UseCaseField[]): ResolvedField[] =>
    fields.flatMap(({ ownerId, key, value }) => {
      const owner = capabilities.find((c) => c.id === ownerId) ?? sections.find((s) => s.id === ownerId);
      const field = owner?.configs.find((f) => f.key === key);
      if (!owner || !field) return [];
      const proposed =
        value === undefined ? field.value : typeof value === 'function' ? value(retailer, field.value) : value;
      return [{ id: `${ownerId}:${key}`, ownerId, ownerName: owner.name, field, proposed }];
    });

  const [initialGlobal] = useState(() => resolveFields(useCase.globalFields));
  const [initialChannel] = useState(() => resolveFields(useCase.channelFields));
  const allFields = [...initialGlobal, ...initialChannel];

  const [step, setStep] = useState(0);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, ConfigValue>>(() =>
    Object.fromEntries(allFields.map((item) => [item.id, item.proposed])),
  );

  const included = (id: string) => !excluded.has(id);
  const toggleIncluded = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submission = (() => {
    const drafts: Record<string, Draft> = {};
    const draftFor = (ownerId: string) => (drafts[ownerId] ??= { features: {}, configs: {} });
    let count = 0;
    for (const item of features) {
      if (item.alreadyOn || !included(item.id)) continue;
      draftFor(item.ownerId).features[item.feature.key] = true;
      count += 1;
    }
    for (const item of allFields) {
      const value = values[item.id];
      if (formatValue(value) === formatValue(item.field.value)) continue;
      draftFor(item.ownerId).configs[item.field.key] = value;
      count += 1;
    }
    return { drafts, count };
  })();

  function renderFields(items: ResolvedField[]) {
    return groupBy(items).map(([ownerName, group]) => (
      <Box key={ownerName} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
        <SectionHeading>{ownerName}</SectionHeading>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {group.map((item) => {
            const value = values[item.id];
            const changed = formatValue(value) !== formatValue(item.field.value);
            return (
              <ConfigFieldRow
                key={item.id}
                field={item.field}
                draftValue={changed ? value : undefined}
                draftLabel={null}
                onChange={(next) => setValues((prev) => ({ ...prev, [item.id]: next }))}
                onRequestAgain={() => {}}
              />
            );
          })}
        </Box>
      </Box>
    ));
  }

  const lastStep = step === steps.length - 1;

  return (
    <Dialog open onClose={onCancel} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: '8px' } } }}>
      <Box sx={{ px: 3, pt: 3 }}>
        <Typography variant="h2">
          {useCase.name}
        </Typography>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mt: '2px' }}>
          {useCase.description} Retailer: <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{retailer.name}</Box>
        </Typography>
        <Box sx={{ mt: 3 }}>
          <StepIndicator current={step} />
        </Box>
      </Box>
      <Divider sx={{ mt: 2 }} />

      <DialogContent sx={{ pt: 3, minHeight: 360 }}>
        {step === 0 && (
          <>
            <StepIntro title="Choose features">
              Turn off any feature you don't want requested. Features that are already on stay as they are.
            </StepIntro>
            {features.length === 0 && <EmptyStep>None of this use case's features are available for this retailer.</EmptyStep>}
            {groupBy(features).map(([ownerName, group]) => (
              <Box key={ownerName} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                <SectionHeading>{ownerName}</SectionHeading>
                <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 3, rowGap: 2 }}>
                  {group.map(({ id, feature, alreadyOn }) => (
                    <Box key={id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {alreadyOn ? (
                        <StateToggle state={feature.state} ariaLabel={`${feature.label} is already on`} presentational />
                      ) : (
                        <StateToggle
                          state={included(id) ? 'live' : 'off'}
                          ariaLabel={feature.label}
                          onChange={() => toggleIncluded(id)}
                        />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {feature.label}
                          </Typography>
                          {feature.state === 'live' && <SuccessPill>Live</SuccessPill>}
                          {feature.state === 'pending' && <PendingPill />}
                        </Box>
                        {feature.description && (
                          <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
                            {feature.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <StepIntro title="Review channel settings">
              Settings for the features you chose. Adjust any value before sending.
            </StepIntro>
            {initialChannel.length === 0 ? <EmptyStep>This use case doesn't set any channel settings.</EmptyStep> : renderFields(initialChannel)}
          </>
        )}

        {step === 2 && (
          <>
            <StepIntro title="Review global settings">
              Retailer-wide settings that need to be in place before these features can run. Adjust any value before
              sending.
            </StepIntro>
            {initialGlobal.length === 0 ? <EmptyStep>This use case doesn't set any global settings.</EmptyStep> : renderFields(initialGlobal)}
          </>
        )}
      </DialogContent>

      <Divider />
      <DialogActions disableSpacing sx={{ px: 3, py: 2, gap: 1 }}>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mr: 'auto' }}>
          {submission.count === 0
            ? 'Nothing will change yet'
            : `${submission.count} change${submission.count === 1 ? '' : 's'} will be sent for approval`}
        </Typography>
        <Button onClick={onCancel} sx={{ color: palette.textSecondary }}>
          Cancel
        </Button>
        {step > 0 && (
          <Button onClick={() => setStep(step - 1)} sx={{ color: brand.periwinkleDark }}>
            Back
          </Button>
        )}
        {lastStep ? (
          <Button variant="contained" disabled={submission.count === 0} onClick={() => onSubmit(submission.drafts)}>
            Send for approval
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setStep(step + 1)}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
