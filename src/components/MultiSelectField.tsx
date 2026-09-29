import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, Divider, Menu, MenuItem, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';

/**
 * Guideline multiselect: Select All / Unselect All in orange at the top,
 * Cancel and Apply at the bottom. Nothing commits until Apply.
 */
export function MultiSelectField({
  value,
  options,
  onChange,
  error,
  inputRef,
}: {
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
  error?: boolean;
  inputRef?: React.Ref<HTMLButtonElement>;
}) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<string[]>(value);

  useEffect(() => {
    if (open) setStaged(value);
  }, [open, value]);

  const allSelected = staged.length === options.length;

  return (
    <>
      <Box
        component="button"
        type="button"
        ref={(node: HTMLButtonElement | null) => {
          anchorRef.current = node;
          if (typeof inputRef === 'function') inputRef(node);
          else if (inputRef) (inputRef as React.RefObject<HTMLButtonElement | null>).current = node;
        }}
        onClick={() => setOpen(true)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: '#FFFFFF',
          border: `1px solid ${error ? palette.errorText : palette.border}`,
          borderRadius: '8px',
          px: 1.5,
          py: '10px',
          font: 'inherit',
          fontSize: 14,
          textAlign: 'left',
          color: value.length ? 'text.primary' : palette.textSecondary,
          cursor: 'pointer',
          '&:focus-visible': { outline: `2px solid ${brand.orange}`, outlineOffset: 1 },
        }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value.length ? value.join(', ') : 'None selected'}
        </Box>
        <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 12, color: palette.textSecondary }} />
      </Box>

      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { minWidth: 280, borderRadius: '8px' } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setStaged(allSelected ? [] : [...options])}
            sx={{
              background: 'none',
              border: 'none',
              p: 0,
              font: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              color: brand.orange,
              cursor: 'pointer',
            }}
          >
            {allSelected ? 'Unselect All' : 'Select All'}
          </Box>
        </Box>
        <Divider />
        {options.map((option) => {
          const checked = staged.includes(option);
          return (
            <MenuItem
              key={option}
              onClick={() =>
                setStaged(checked ? staged.filter((o) => o !== option) : [...staged, option])
              }
              sx={{ gap: 1 }}
            >
              <Checkbox checked={checked} size="small" sx={{ p: 0, color: palette.border, '&.Mui-checked': { color: brand.orange } }} />
              <Typography variant="body2">{option}</Typography>
            </MenuItem>
          );
        })}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 2, py: 1.5 }}>
          <Button size="small" onClick={() => setOpen(false)} sx={{ color: palette.textSecondary }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onChange(staged);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </Box>
      </Menu>
    </>
  );
}
