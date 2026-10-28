import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import { navGroups, globalSettingSections } from '../data/capabilities';
import { computeCapabilityStatus } from '../logic/status';
import { Chip, PendingPill, SuccessPill } from './ui';
import type { Capability, CapabilityStatus } from '../types';

interface Props {
  capabilities: Capability[];
  selectedId: string | null;
  selectedGroup: string;
  onSelect: (id: string) => void;
  onSelectGroup: (group: string) => void;
}

/**
 * Nav chips use the cards' status language, shortened to fit a 240px column. They
 * ride collapsed so the full capability name has the row to itself, and expand on
 * hover, which squeezes the name into an ellipsis for as long as the pointer rests.
 */
function NavChip({ status, expanded }: { status: CapabilityStatus; expanded: boolean }) {
  const collapsed = !expanded;
  if (status === 'pending') return <PendingPill collapsed={collapsed}>Pending</PendingPill>;
  if (status === 'incomplete')
    return (
      <Chip tone="warning" icon={faTriangleExclamation} iconColor={palette.amber} collapsed={collapsed}>
        Incomplete
      </Chip>
    );
  return <SuccessPill collapsed={collapsed}>Live</SuccessPill>;
}

function NavItem({
  label,
  selected,
  onClick,
  chip,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Rendered with the row's hover/focus state so the chip can expand into it. */
  chip?: (expanded: boolean) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        textAlign: 'left',
        background: selected ? palette.pillBg : 'none',
        border: 'none',
        font: 'inherit',
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        color: 'text.primary',
        borderRadius: '8px',
        py: 0.5,
        pl: 2,
        pr: 1.5,
        cursor: 'pointer',
        // Selected items get no hover state.
        '&:hover': selected ? {} : { bgcolor: '#F7F7F7' },
      }}
    >
      <Box
        component="span"
        sx={{ flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {label}
      </Box>
      {chip?.(expanded)}
    </Box>
  );
}

export function LeftNav({ capabilities, selectedId, selectedGroup, onSelect, onSelectGroup }: Props) {
  return (
    <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {navGroups.map((group) => {
        const isGlobal = group === 'Retailer global settings';
        const items = isGlobal ? [] : capabilities.filter((c) => c.navGroup === group);
        if (!isGlobal && items.length === 0) return null;

        const groupActive = group === selectedGroup;

        return (
          <Box key={group}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                mb: 0.5,
                color: groupActive ? brand.periwinkleDark : 'text.primary',
                '&:hover': groupActive ? {} : { bgcolor: '#F7F7F7' },
              }}
            >
              <Typography
                component="button"
                type="button"
                variant="body2"
                onClick={() => onSelectGroup(group)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  font: 'inherit',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'inherit',
                  py: 0.5,
                  pl: 2,
                  pr: 1,
                  cursor: 'pointer',
                }}
              >
                {group}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {isGlobal
                ? globalSettingSections.map((section) => (
                    <NavItem
                      key={section.id}
                      label={section.name}
                      selected={selectedId === section.id}
                      onClick={() => onSelect(section.id)}
                    />
                  ))
                : items.map((capability) => {
                    const status = computeCapabilityStatus(capability).status;
                    const chipped = status === 'pending' || status === 'live' || status === 'incomplete';
                    return (
                      <NavItem
                        key={capability.id}
                        label={capability.name}
                        selected={selectedId === capability.id}
                        onClick={() => onSelect(capability.id)}
                        chip={chipped ? (expanded) => <NavChip status={status} expanded={expanded} /> : undefined}
                      />
                    );
                  })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
