import { useId } from 'react';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';

interface NamedOption {
  id: string;
  name: string;
  code: string;
}

/** A labeled select whose options read as a name with the platform code beside it. */
export function ScopeSelect({
  label,
  options,
  value,
  onChange,
  width = 320,
}: {
  label: string;
  options: NamedOption[];
  value: string;
  onChange: (id: string) => void;
  width?: number;
}) {
  const labelId = useId();
  const renderOption = (option: NamedOption) => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {option.name}
      </Box>
      <Box component="span" sx={{ fontSize: 12, color: palette.textSecondary }}>
        {option.code}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width }}>
      <Typography id={labelId} variant="body2" component="div" sx={{ fontWeight: 600, mb: 0.75 }}>
        {label}
      </Typography>
      <Select
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ input: { 'aria-labelledby': labelId } }}
        renderValue={(selected) => {
          const option = options.find((o) => o.id === selected);
          return option ? renderOption(option) : null;
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id} sx={{ justifyContent: 'space-between', gap: 2 }}>
            {renderOption(option)}
            {option.id === value && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12, color: brand.periwinkleDark }} />}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
