import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { brand, cardShadow, palette } from '../theme';
import { StateToggle } from './StateToggle';
import { StatusPill, TextAction } from './ui';
import type { CapabilityStatus, ToggleState } from '../types';

const VISIBLE_CAP = 4;

export interface CompactCardItem {
  id: string;
  name: string;
  caption?: string;
  summary: string;
  status?: CapabilityStatus;
  /** The master switch, when the item has one. */
  toggle?: {
    state: ToggleState;
    disabled?: boolean;
    disabledReason?: string;
    onChange: (next: boolean) => void;
  };
}

function CompactCard({
  item,
  selected,
  onSelect,
}: {
  item: CompactCardItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: cardShadow,
        // The inset ring keeps every card the same size whether or not it's selected.
        outline: selected ? `2px solid ${brand.periwinkleDark}` : '2px solid transparent',
        outlineOffset: '-2px',
        p: 2,
        cursor: 'pointer',
        transition: 'outline-color 120ms ease',
        '&:hover': selected ? {} : { outlineColor: brand.periwinkleLight },
        '&:focus-visible': { outlineColor: brand.periwinkleDark },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h3" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </Typography>
        {item.toggle && (
          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'inline-flex', pt: '3px' }}>
            <StateToggle
              state={item.toggle.state}
              ariaLabel={`${item.name} master switch`}
              disabled={item.toggle.disabled}
              disabledReason={item.toggle.disabledReason}
              onChange={item.toggle.onChange}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        {item.caption && (
          <Typography
            variant="caption"
            sx={{
              color: palette.textSecondary,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {item.caption}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
          {item.summary}
        </Typography>
      </Box>

      {item.status && (
        <Box sx={{ display: 'flex', mt: 'auto' }}>
          <StatusPill status={item.status} />
        </Box>
      )}
    </Box>
  );
}

/** Row of small cards above the card layout's expanded view; one is selected at a time. */
export function CompactCardStrip({
  items,
  selectedId,
  onSelect,
}: {
  items: CompactCardItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const overflowing = items.length > VISIBLE_CAP;

  let visible = items;
  if (overflowing && !showAll) {
    visible = items.slice(0, VISIBLE_CAP);
    // A card selected from the left nav takes the last slot so the selection is never hidden.
    const selected = items.find((item) => item.id === selectedId);
    if (selected && !visible.includes(selected)) visible = [...visible.slice(0, VISIBLE_CAP - 1), selected];
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VISIBLE_CAP}, minmax(0, 1fr))`,
          gap: 2,
        }}
      >
        {visible.map((item) => (
          <CompactCard
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </Box>

      {overflowing && (
        <Box sx={{ mt: 1.5 }}>
          <TextAction icon={showAll ? faAngleUp : faAngleDown} onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show fewer' : `See all ${items.length}`}
          </TextAction>
        </Box>
      )}
    </Box>
  );
}
