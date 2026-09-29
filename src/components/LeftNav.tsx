import { Box, Typography } from '@mui/material';
import { brand } from '../theme';
import { navGroups, globalSettingSections } from '../data/capabilities';
import { computeCapabilityStatus } from '../logic/status';
import { StatusDot } from './ui';
import type { Capability } from '../types';

interface Props {
  capabilities: Capability[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function NavItem({
  label,
  selected,
  onClick,
  dot,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  dot?: React.ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        textAlign: 'left',
        background: selected ? brand.orangeTint : 'none',
        border: 'none',
        borderLeft: selected ? `2px solid ${brand.orange}` : '2px solid transparent',
        font: 'inherit',
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        color: 'text.primary',
        borderRadius: '8px',
        py: 1,
        pl: 2,
        pr: 1.5,
        cursor: 'pointer',
        // Selected items get no hover state.
        '&:hover': selected ? {} : { bgcolor: '#F7F7F7' },
      }}
    >
      {dot}
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Box>
    </Box>
  );
}

export function LeftNav({ capabilities, selectedId, onSelect }: Props) {
  return (
    <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {navGroups.map((group) => {
        const isGlobal = group === 'Retailer global settings';
        const items = isGlobal ? [] : capabilities.filter((c) => c.navGroup === group);
        if (!isGlobal && items.length === 0) return null;

        return (
          <Box key={group}>
            <Typography
              variant="h2"
              sx={{ fontSize: 16, mb: 1.5, pl: 2 }}
            >
              {group}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {isGlobal
                ? globalSettingSections.map((section) => (
                    <NavItem
                      key={section.id}
                      label={section.name}
                      selected={selectedId === section.id}
                      onClick={() => onSelect(section.id)}
                    />
                  ))
                : items.map((capability) => (
                    <NavItem
                      key={capability.id}
                      label={capability.name}
                      selected={selectedId === capability.id}
                      onClick={() => onSelect(capability.id)}
                      dot={<StatusDot status={computeCapabilityStatus(capability).status} />}
                    />
                  ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
