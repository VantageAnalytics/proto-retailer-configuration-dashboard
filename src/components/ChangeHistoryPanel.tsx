import { useState } from 'react';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
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
function Entry({ event }: { event: ChangeEvent }) {
  return (
    <Box
      sx={{ borderBottom: `1px solid ${palette.border}`, pb: 1.5, mb: 1.5, '&:last-of-type': { border: 'none', mb: 0 } }}
    >
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
