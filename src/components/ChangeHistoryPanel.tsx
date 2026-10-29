import { useId, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { brand, cardShadow, palette } from '../theme';
import { ErrorPill, PendingPill, Pill, SuccessPill } from './ui';
import type { ChangeEvent } from '../types';

/** Width of the history rail reserved inside each card, collapsed and expanded. */
const RAIL_WIDTH = 300;
const RAIL_COLLAPSED_WIDTH = 40;

/**
 * The rail sits inside the card body, so its divider is pulled out to the card's
 * header rule and bottom padding edge and the inset is given back as padding.
 */
const railBleed = {
  alignSelf: 'stretch',
  mt: -3,
  mb: -3,
  pt: 3,
  pb: 3,
} as const;

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** The author line and the description differ per kind; the frame around them doesn't. */
function Entry({ event, ownerName }: { event: ChangeEvent; ownerName?: string }) {
  return (
    <Box
      sx={{ borderBottom: `1px solid ${palette.border}`, pb: 1.5, mb: 1.5, '&:last-of-type': { border: 'none', mb: 0 } }}
    >
      {ownerName && (
        <Typography
          variant="caption"
          sx={{ color: brand.periwinkleDark, display: 'block', fontWeight: 600, mb: 0.25 }}
        >
          {ownerName}
        </Typography>
      )}
      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block' }}>
        <Box component="span" sx={{ fontWeight: 600 }}>
          {event.actor}
        </Box>{' '}
        · {formatTimestamp(event.timestamp)}
      </Typography>

      {event.kind === 'note' ? (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          {event.body}
        </Typography>
      ) : (
        <>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
            {event.settingLabel}: {event.from} → {event.to}
          </Typography>
          {event.reason && (
            <Typography
              variant="caption"
              sx={{
                color: event.status === 'declined' ? palette.errorText : palette.textSecondary,
                display: 'block',
              }}
            >
              {event.reason}
            </Typography>
          )}
        </>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
        {event.kind === 'note' && <Pill>Note</Pill>}
        {event.kind === 'change' && event.status === 'applied' && <SuccessPill>Approved</SuccessPill>}
        {event.kind === 'change' && event.status === 'pending' && <PendingPill>Requested</PendingPill>}
        {event.kind === 'change' && event.status === 'declined' && <ErrorPill>Declined</ErrorPill>}
      </Box>
    </Box>
  );
}

function NoteComposer({ onAddNote }: { onAddNote: (body: string) => void }) {
  const [body, setBody] = useState('');
  const trimmed = body.trim();

  function submit() {
    if (!trimmed) return;
    onAddNote(trimmed);
    setBody('');
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        value={body}
        onChange={(e) => setBody(e.target.value)}
        // Enter submits so a short note doesn't need a trip to the button; Shift+Enter
        // still breaks the line for longer ones.
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Add a note to the change history"
        aria-label="Add a note to the change history"
        multiline
        minRows={3}
        size="small"
        fullWidth
      />
      <Button
        variant="contained"
        size="small"
        onClick={submit}
        disabled={!trimmed}
        sx={{ mt: 1 }}
      >
        Add note
      </Button>
    </Box>
  );
}

/**
 * Change history for a single card, shown in a rail on the right of the card body.
 * The rail keeps its column when collapsed so the card content doesn't reflow, and
 * grows with the card instead of scrolling inside a fixed height.
 */
export function CardChangeHistory({
  events,
  collapsed,
  onToggleCollapsed,
  onAddNote,
}: {
  events: ChangeEvent[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onAddNote: (body: string) => void;
}) {
  if (collapsed) {
    return (
      <Box
        sx={{
          width: RAIL_COLLAPSED_WIDTH,
          flexShrink: 0,
          borderLeft: `1px solid ${palette.border}`,
          ...railBleed,
          pl: 0.5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Tooltip title="Show change history">
          <IconButton onClick={onToggleCollapsed} size="small" aria-label="Show change history">
            <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 14, color: brand.periwinkleDark }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        borderLeft: `1px solid ${palette.border}`,
        ...railBleed,
        pl: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h3">Change history</Typography>
        <Tooltip title="Collapse change history">
          <IconButton onClick={onToggleCollapsed} size="small" aria-label="Collapse change history">
            <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 14, color: palette.textSecondary }} />
          </IconButton>
        </Tooltip>
      </Box>

      {events.length === 0 ? (
        <Typography variant="body2" sx={{ color: palette.textSecondary }}>
          No changes recorded yet.
        </Typography>
      ) : (
        events.map((event) => <Entry key={event.id} event={event} />)
      )}

      <NoteComposer onAddNote={onAddNote} />
    </Box>
  );
}

/** A nav group and the capabilities or settings sections under it, as the history filter lists them. */
export interface HistoryOwnerGroup {
  group: string;
  owners: { id: string; name: string }[];
}

const ALL = 'all';
const groupValue = (group: string) => `group:${group}`;

/**
 * The page's whole change history in its own section, filterable to one nav group
 * or one capability. Notes can only be added once a single capability is picked,
 * since every note belongs to one.
 */
export function ChangeHistorySection({
  events,
  groups,
  onAddNote,
}: {
  events: ChangeEvent[];
  groups: HistoryOwnerGroup[];
  onAddNote: (ownerId: string, body: string) => void;
}) {
  const labelId = useId();
  const [filter, setFilter] = useState(ALL);

  const ownerNames = new Map(groups.flatMap((g) => g.owners.map((o) => [o.id, o.name] as const)));
  const countFor = (ids: string[]) => events.filter((event) => ids.includes(event.capabilityId)).length;

  const selectedGroup = groups.find((g) => groupValue(g.group) === filter);
  const selectedOwner = ownerNames.has(filter) ? filter : null;

  const visible =
    filter === ALL
      ? events
      : selectedGroup
        ? events.filter((event) => selectedGroup.owners.some((o) => o.id === event.capabilityId))
        : events.filter((event) => event.capabilityId === filter);

  const filterLabel = (value: string) => {
    if (value === ALL) return 'All history';
    const group = groups.find((g) => groupValue(g.group) === value);
    if (group) return `All ${group.group}`;
    return ownerNames.get(value) ?? 'All history';
  };

  return (
    <Box
      component="section"
      aria-label="Change history"
      sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: cardShadow, p: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 14, color: brand.periwinkleDark }} />
        <Typography variant="h2">Change history</Typography>
      </Box>
      <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: '2px' }}>
        Every change and note on this page
      </Typography>

      <Typography id={labelId} variant="body2" component="div" sx={{ fontWeight: 600, mt: 2, mb: 0.75 }}>
        Show
      </Typography>
      <Select
        fullWidth
        size="small"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        renderValue={filterLabel}
        slotProps={{ input: { 'aria-labelledby': labelId } }}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 420 } } } }}
      >
        <MenuItem value={ALL} sx={{ justifyContent: 'space-between', gap: 2, fontWeight: 600 }}>
          All history
          <Count n={events.length} />
        </MenuItem>
        {groups.flatMap((group) => [
          <MenuItem
            key={group.group}
            value={groupValue(group.group)}
            sx={{ justifyContent: 'space-between', gap: 2, fontWeight: 600, borderTop: `1px solid ${palette.border}` }}
          >
            {group.group}
            <Count n={countFor(group.owners.map((o) => o.id))} />
          </MenuItem>,
          ...group.owners.map((owner) => (
            <MenuItem key={owner.id} value={owner.id} sx={{ justifyContent: 'space-between', gap: 2, pl: 4 }}>
              {owner.name}
              <Count n={countFor([owner.id])} />
            </MenuItem>
          )),
        ])}
      </Select>

      <Box sx={{ mt: 2.5 }}>
        {visible.length === 0 ? (
          <Typography variant="body2" sx={{ color: palette.textSecondary }}>
            No changes recorded yet.
          </Typography>
        ) : (
          visible.map((event) => (
            <Entry
              key={event.id}
              event={event}
              ownerName={selectedOwner ? undefined : ownerNames.get(event.capabilityId)}
            />
          ))
        )}
      </Box>

      {selectedOwner ? (
        <NoteComposer key={selectedOwner} onAddNote={(body) => onAddNote(selectedOwner, body)} />
      ) : (
        <Typography variant="caption" sx={{ color: palette.textSecondary, display: 'block', mt: 2 }}>
          Pick a single capability to add a note.
        </Typography>
      )}
    </Box>
  );
}

function Count({ n }: { n: number }) {
  return (
    <Box component="span" sx={{ fontSize: 12, color: palette.textSecondary, fontWeight: 400 }}>
      {n}
    </Box>
  );
}
