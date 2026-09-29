import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { brand, cardShadow, palette } from '../theme';
import { ErrorPill, PendingPill, Pill, SourceTag, SuccessPill } from './ui';
import type { ChangeEvent } from '../types';

type Filter = 'all' | 'capability';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        font: 'inherit',
        fontSize: 12,
        fontWeight: selected ? 600 : 400,
        borderRadius: '8px',
        px: 1.5,
        py: '4px',
        cursor: 'pointer',
        bgcolor: selected ? brand.orangeTint : palette.pillBg,
        color: selected ? brand.orangeDark : palette.textSecondary,
        border: `1px solid ${selected ? brand.orangeLight : 'transparent'}`,
        '&:hover': selected ? {} : { bgcolor: '#EDEDED' },
      }}
    >
      {label}
    </Box>
  );
}

function Entry({ event }: { event: ChangeEvent }) {
  return (
    <Box sx={{ borderBottom: `1px solid ${palette.border}`, pb: 2, mb: 2, '&:last-of-type': { border: 'none', mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {event.settingLabel}
        </Typography>
        {event.status === 'applied' && <SuccessPill>Applied</SuccessPill>}
        {event.status === 'pending' && <PendingPill>Pending</PendingPill>}
        {event.status === 'declined' && <ErrorPill>Declined</ErrorPill>}
      </Box>

      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
        {event.capabilityId}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <Box component="span" sx={{ color: palette.textSecondary }}>
          {event.from}
        </Box>{' '}
        → <Box component="span" sx={{ fontWeight: 600 }}>{event.to}</Box>
      </Typography>

      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: 1 }}>
        Requested by {event.requestedBy}
      </Typography>
      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block' }}>
        {event.status === 'pending'
          ? 'Awaiting approval'
          : `${event.status === 'declined' ? 'Declined' : 'Approved'} by ${event.approvedBy}`}
      </Typography>
      {event.reason && (
        <Typography variant="caption" sx={{ color: palette.errorText, display: 'block', mt: '2px' }}>
          {event.reason}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <SourceTag source={event.source} />
        <Pill>{formatTimestamp(event.timestamp)}</Pill>
      </Box>
    </Box>
  );
}

export function ChangeHistoryPanel({
  events,
  activeCapabilityId,
  collapsed,
  onToggleCollapsed,
  filter,
  onFilterChange,
}: {
  events: ChangeEvent[];
  activeCapabilityId: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  filter: Filter;
  onFilterChange: (next: Filter) => void;
}) {
  if (collapsed) {
    return (
      <Box
        sx={{
          width: 48,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: cardShadow,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 24,
          alignSelf: 'flex-start',
        }}
      >
        <Tooltip title="Show change history">
          <IconButton onClick={onToggleCollapsed} size="small" aria-label="Show change history">
            <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 14, color: brand.orange }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  const visible =
    filter === 'capability' && activeCapabilityId
      ? events.filter((e) => e.capabilityId === activeCapabilityId)
      : events;

  return (
    <Box
      sx={{
        width: 320,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: cardShadow,
        p: 2.5,
        position: 'sticky',
        top: 24,
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h2">Change history</Typography>
        <Tooltip title="Collapse panel">
          <IconButton onClick={onToggleCollapsed} size="small" aria-label="Collapse change history">
            <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 14, color: palette.textSecondary }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 3 }}>
        <FilterChip label="All" selected={filter === 'all'} onClick={() => onFilterChange('all')} />
        <FilterChip
          label="This capability"
          selected={filter === 'capability'}
          onClick={() => onFilterChange('capability')}
        />
      </Box>

      {visible.length === 0 ? (
        <Typography variant="body2" sx={{ color: palette.textSecondary }}>
          No changes recorded yet.
        </Typography>
      ) : (
        visible.map((event) => <Entry key={event.id} event={event} />)
      )}
    </Box>
  );
}
