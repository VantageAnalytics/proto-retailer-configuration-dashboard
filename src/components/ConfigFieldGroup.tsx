import { Box } from '@mui/material';
import { ConfigFieldRow, type ConfigValue } from './ConfigFieldRow';
import type { ConfigField } from '../types';

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: 3,
        rowGap: 2,
      }}
    >
      {children}
    </Box>
  );
}

/** Required fields rise to the top of their block; ties keep the authored order. */
function requiredFirst(fields: ConfigField[]): ConfigField[] {
  return [
    ...fields.filter((field) => field.required !== 'Optional'),
    ...fields.filter((field) => field.required === 'Optional'),
  ];
}

/**
 * The fields of one configuration group. Inputs are listed first and toggles after,
 * so a section never alternates between control types down the column.
 */
export function ConfigFieldGroup({
  fields,
  draftConfigs,
  onChange,
  registerFieldRef,
}: {
  fields: ConfigField[];
  draftConfigs: Record<string, ConfigValue>;
  onChange: (key: string, next: ConfigValue) => void;
  registerFieldRef: (key: string, node: HTMLElement | null) => void;
}) {
  const inputs = requiredFirst(fields.filter((field) => field.inputType !== 'toggle'));
  const toggles = requiredFirst(fields.filter((field) => field.inputType === 'toggle'));

  function row(field: ConfigField) {
    return (
      <ConfigFieldRow
        key={field.key}
        field={field}
        draftValue={draftConfigs[field.key]}
        onChange={(next) => onChange(field.key, next)}
        onRequestAgain={() => onChange(field.key, field.value)}
        fieldRef={(node) => registerFieldRef(field.key, node)}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {inputs.length > 0 && <FieldGrid>{inputs.map(row)}</FieldGrid>}
      {toggles.length > 0 && <FieldGrid>{toggles.map(row)}</FieldGrid>}
    </Box>
  );
}
