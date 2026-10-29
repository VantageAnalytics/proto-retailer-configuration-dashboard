import { useMemo, useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, Divider, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import { formatValue } from '../logic/status';
import type { Capability, ConfigField, Feature, GlobalSection, Retailer, UseCase, UseCaseField } from '../types';
import type { Draft } from './CapabilityCard';
import { ConfigFieldRow, type ConfigValue } from './ConfigFieldRow';
import { PendingPill, SectionHeading, SuccessPill } from './ui';

const steps = ['Features', 'Global settings', 'Channel settings'] as const;

const checkboxSx = { p: 0, mt: '2px', color: palette.border, '&.Mui-checked': { color: brand.periwinkleDark } };

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
 * Walks through the features and settings a use case sets for one retailer. Every item
 * starts included; whatever is left checked and differs from today is sent for approval.
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
      if (!included(item.id) || formatValue(value) === formatValue(item.field.value)) continue;
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
            const on = included(item.id);
            const value = values[item.id];
            const changed = formatValue(value) !== formatValue(item.field.value);
            return (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Checkbox
                  size="small"
                  checked={on}
                  onChange={() => toggleIncluded(item.id)}
                  slotProps={{ input: { 'aria-label': `Include ${item.field.label}` } }}
                  sx={checkboxSx}
                />
                <Box
                  aria-disabled={!on}
                  sx={{ flex: 1, minWidth: 0, opacity: on ? 1 : 0.5, pointerEvents: on ? 'auto' : 'none' }}
                >
                  <ConfigFieldRow
                    field={item.field}
                    draftValue={changed ? value : undefined}
                    draftLabel={null}
                    onChange={(next) => setValues((prev) => ({ ...prev, [item.id]: next }))}
                    onRequestAgain={() => {}}
                  />
                </Box>
              </Box>
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
        <Typography
          variant="caption"
          sx={{ color: palette.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Use case
        </Typography>
        <Typography variant="h2" sx={{ mt: '2px' }}>
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
              Uncheck any feature you don't want requested. Features that are already on stay as they are.
            </StepIntro>
            {features.length === 0 && <EmptyStep>None of this use case's features are available for this retailer.</EmptyStep>}
            {groupBy(features).map(([ownerName, group]) => (
              <Box key={ownerName} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                <SectionHeading>{ownerName}</SectionHeading>
                <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 3, rowGap: 2 }}>
                  {group.map(({ id, feature, alreadyOn }) => (
                    <Box
                      key={id}
                      component="label"
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: alreadyOn ? 'default' : 'pointer' }}
                    >
                      <Checkbox
                        size="small"
                        checked={alreadyOn || included(id)}
                        disabled={alreadyOn}
                        onChange={() => toggleIncluded(id)}
                        sx={{ ...checkboxSx, '&.Mui-disabled.Mui-checked': { color: palette.greyTrack } }}
                      />
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
            <StepIntro title="Review global settings">
              Retailer global settings this use case sets. Adjust a value, or uncheck it to leave it as it is.
            </StepIntro>
            {initialGlobal.length === 0 ? <EmptyStep>This use case doesn't set any global settings.</EmptyStep> : renderFields(initialGlobal)}
          </>
        )}

        {step === 2 && (
          <>
            <StepIntro title="Review channel settings">
              Channel settings this use case sets. Adjust a value, or uncheck it to leave it as it is.
            </StepIntro>
            {initialChannel.length === 0 ? <EmptyStep>This use case doesn't set any channel settings.</EmptyStep> : renderFields(initialChannel)}
          </>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
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
