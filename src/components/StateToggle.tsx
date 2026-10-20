import { Box, Tooltip } from '@mui/material';
import { brand, palette } from '../theme';
import type { ToggleState } from '../types';

/**
 * Guideline toggle: the circle is deliberately larger than the track.
 * On is a deep Periwinkle circle at the right of a Periwinkle track; off is a white
 * circle over a grey track. Pending looks the same as Live because the toggle only
 * reports on/off; the Pending pill beside the label carries the approval state.
 */
export function StateToggle({
  state,
  onChange,
  disabled,
  disabledReason,
  ariaLabel,
  presentational,
}: {
  state: ToggleState;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  ariaLabel: string;
  /** Renders as a span so the toggle can sit inside a clickable card header. */
  presentational?: boolean;
}) {
  const isOn = state === 'live' || state === 'pending';

  const trackColor = disabled ? '#EDEDED' : isOn ? brand.periwinkle : palette.greyTrack;

  const circleColor = disabled ? '#F5F5F5' : isOn ? brand.periwinkleDark : '#FFFFFF';

  const control = (
    <Box
      component={presentational ? 'span' : 'button'}
      type={presentational ? undefined : 'button'}
      role={presentational ? 'img' : 'switch'}
      aria-checked={presentational ? undefined : isOn}
      aria-label={ariaLabel}
      disabled={presentational ? undefined : disabled}
      onClick={presentational ? undefined : () => onChange?.(!isOn)}
      sx={{
        position: 'relative',
        width: 34,
        height: 18,
        border: 'none',
        background: 'none',
        padding: 0,
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 2,
          right: 2,
          height: 10,
          borderRadius: 5,
          bgcolor: trackColor,
          transition: 'background-color 120ms ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: isOn ? 16 : 0,
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: circleColor,
          border: isOn ? 'none' : `1px solid ${palette.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 120ms ease, background-color 120ms ease',
        }}
      />
    </Box>
  );

  if (disabled && disabledReason) {
    return (
      <Tooltip title={disabledReason}>
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {control}
        </Box>
      </Tooltip>
    );
  }
  return control;
}
