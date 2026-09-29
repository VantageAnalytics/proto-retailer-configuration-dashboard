import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import { isEmptyValue } from '../logic/status';
import { MultiSelectField } from './MultiSelectField';
import { StateToggle } from './StateToggle';
import { ErrorPill, PendingPill, Pill, RequiredTag, SourceTag, TextAction } from './ui';
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
  const missing = field.required !== 'Optional' && isEmptyValue(value);
  const blocking = field.required === 'BlocksPublishing' && isEmptyValue(value);

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
          error={blocking}
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
          error={blocking}
          inputRef={fieldRef as React.Ref<HTMLButtonElement>}
        />
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        error={blocking}
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
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {field.label}
        </Typography>
        <SourceTag source={field.source} />
        <RequiredTag level={field.required} />
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
        {!unsaved && field.state === 'pending' && <PendingPill />}
        {!unsaved && field.state === 'declined' && <ErrorPill>Declined</ErrorPill>}
      </Box>

      {control()}

      {blocking && (
        <Typography variant="caption" sx={{ color: palette.errorText, display: 'block', mt: '4px' }}>
          Missing
        </Typography>
      )}
      {!blocking && missing && (
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '4px' }}>
          Missing
        </Typography>
      )}
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
      {field.description && !blocking && !missing && (
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '4px' }}>
          {field.description}
        </Typography>
      )}
      {field.inputType === 'multiselect' && field.key === 'facebook_pages' && (
        <Box sx={{ mt: 1 }}>
          <Pill title="The first selected Page is used as the primary Page">Primary: {((value as string[]) ?? [])[0] ?? 'none'}</Pill>
        </Box>
      )}
    </Box>
  );
}
