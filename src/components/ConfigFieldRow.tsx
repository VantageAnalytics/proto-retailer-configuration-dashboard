import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { palette } from '../theme';
import { isEmptyValue } from '../logic/status';
import { MultiSelectField } from './MultiSelectField';
import { StateToggle } from './StateToggle';
import { Chip, ErrorPill, PendingPill, Pill, TextAction } from './ui';
import type { ConfigField } from '../types';

export type ConfigValue = string | string[] | boolean | null;

export function ConfigFieldRow({
  field,
  draftValue,
  onChange,
  onRequestAgain,
  fieldRef,
}: {
  field: ConfigField;
  draftValue: ConfigValue | undefined;
  onChange: (next: ConfigValue) => void;
  onRequestAgain: () => void;
  fieldRef?: (node: HTMLElement | null) => void;
}) {
  const unsaved = draftValue !== undefined;
  const value = unsaved ? draftValue : field.value;
  const required = field.required !== 'Optional';
  const missing = required && isEmptyValue(value);

  function control() {
    if (field.inputType === 'toggle') {
      return (
        <Box sx={{ py: '6px' }}>
          <StateToggle
            state={value === true ? 'live' : 'off'}
            ariaLabel={field.label}
            onChange={(next) => onChange(next)}
          />
        </Box>
      );
    }

    if (field.inputType === 'select') {
      return (
        <Select
          fullWidth
          size="small"
          displayEmpty
          error={missing}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          inputRef={fieldRef}
          renderValue={(selected) =>
            selected ? (
              (selected as string)
            ) : (
              <Box component="span" sx={{ color: palette.textSecondary }}>
                Not set
              </Box>
            )
          }
        >
          <MenuItem value="">
            <Box component="span" sx={{ color: palette.textSecondary }}>
              Not set
            </Box>
          </MenuItem>
          {field.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      );
    }

    if (field.inputType === 'multiselect') {
      return (
        <MultiSelectField
          value={(value as string[]) ?? []}
          options={field.options ?? []}
          onChange={onChange}
          error={missing}
          inputRef={fieldRef as React.Ref<HTMLButtonElement>}
        />
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        error={missing}
        value={(value as string) ?? ''}
        placeholder="Not set"
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        inputRef={fieldRef}
        slotProps={{ htmlInput: { autoComplete: 'off', 'data-1p-ignore': 'true' } }}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {field.label}
        </Typography>
        {required && <Chip>Required</Chip>}
        {unsaved && <Chip tone="info">Unsaved</Chip>}
        {!unsaved && field.state === 'pending' && <PendingPill />}
        {!unsaved && field.state === 'declined' && <ErrorPill>Declined</ErrorPill>}
      </Box>

      {field.description && (
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '-2px', mb: 0.5 }}>
          {field.description}
        </Typography>
      )}

      {control()}

      {!unsaved && field.state === 'declined' && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
          <Typography variant="caption" sx={{ color: palette.errorText }}>
            Declined by {field.declinedBy}: {field.declinedReason}
          </Typography>
          <TextAction icon={faRotateRight} onClick={onRequestAgain}>
            Request again
          </TextAction>
        </Box>
      )}
      {field.inputType === 'multiselect' && field.key === 'facebook_pages' && (
        <Box sx={{ mt: 1 }}>
          <Pill title="The first selected Page is used as the primary Page">Primary: {((value as string[]) ?? [])[0] ?? 'none'}</Pill>
        </Box>
      )}
    </Box>
  );
}
