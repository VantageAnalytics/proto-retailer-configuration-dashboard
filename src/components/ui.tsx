import type { ReactNode } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { brand, palette } from '../theme';
import type { CapabilityStatus, RequiredLevel, Source } from '../types';

/** Clarifying pill next to a label: #f5f5f5 background, #666 text, 12px. */
export function Pill({ children, title }: { children: ReactNode; title?: string }) {
  const pill = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: palette.pillBg,
        color: palette.textSecondary,
        fontSize: 12,
        lineHeight: 1.4,
        borderRadius: '8px',
        px: 1,
        py: '2px',
        whiteSpace: 'nowrap',
        cursor: title ? 'help' : 'default',
      }}
    >
      {children}
    </Box>
  );
  return title ? <Tooltip title={title}>{pill}</Tooltip> : pill;
}

/** Green circle with a white check, very light green background, dark green label. */
export function SuccessPill({ children }: { children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: palette.successBg,
        border: `1px solid ${palette.successBorder}`,
        color: palette.successText,
        fontSize: 12,
        fontWeight: 600,
        borderRadius: '8px',
        px: 1,
        py: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: palette.successCircle,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={faCheck} style={{ color: '#FFFFFF', fontSize: 8 }} />
      </Box>
      {children}
    </Box>
  );
}

/** Solid red background, white circle with a red exclamation, white label. */
export function ErrorPill({ children }: { children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: palette.errorBg,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 600,
        borderRadius: '8px',
        px: 1,
        py: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={faExclamation} style={{ color: palette.errorBg, fontSize: 8 }} />
      </Box>
      {children}
    </Box>
  );
}

export function PendingPill({ children = 'Pending approval' }: { children?: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: palette.amberBg,
        border: `1px solid ${palette.warningBorder}`,
        color: palette.amber,
        fontSize: 12,
        fontWeight: 600,
        borderRadius: '8px',
        px: 1,
        py: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

const statusLabels: Record<CapabilityStatus, string> = {
  off: 'Off',
  pending: 'Pending approval',
  declined: 'Declined',
  incomplete: 'Incomplete',
  live: 'Live',
  unavailable: 'Not available',
};

export function StatusPill({ status }: { status: CapabilityStatus }) {
  if (status === 'live') return <SuccessPill>Live</SuccessPill>;
  if (status === 'declined') return <ErrorPill>Declined</ErrorPill>;
  if (status === 'pending') return <PendingPill />;
  if (status === 'incomplete')
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: palette.warningBg,
          border: `1px solid ${palette.warningBorder}`,
          color: palette.amber,
          fontSize: 12,
          fontWeight: 600,
          borderRadius: '8px',
          px: 1,
          py: '2px',
        }}
      >
        <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 10 }} />
        Incomplete
      </Box>
    );
  return <Pill>{statusLabels[status]}</Pill>;
}

const dotColors: Record<CapabilityStatus, string> = {
  live: palette.successCircle,
  incomplete: brand.orange,
  pending: palette.amber,
  declined: palette.errorBg,
  off: palette.greyTrack,
  unavailable: '#DADADA',
};

export function StatusDot({ status }: { status: CapabilityStatus }) {
  return (
    <Tooltip title={statusLabels[status]}>
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: dotColors[status],
          flexShrink: 0,
        }}
      />
    </Tooltip>
  );
}

export const sourceLabels: Record<Source, string> = {
  LaunchDarkly: 'LaunchDarkly',
  AppConfig: 'App Config',
  Database: 'Database',
  Code: 'Code',
};

export function SourceTag({ source }: { source: Source }) {
  return <Pill title={`Stored in ${sourceLabels[source]}`}>{sourceLabels[source]}</Pill>;
}

const requiredLabels: Record<RequiredLevel, string> = {
  BlocksPublishing: 'Blocks publishing',
  BreaksFeature: 'Breaks a feature',
  Optional: 'Optional',
};

export function RequiredTag({ level, note }: { level: RequiredLevel; note?: string }) {
  const label = note ? `${requiredLabels[level]} (${note})` : requiredLabels[level];
  return <Pill>{label}</Pill>;
}

type BannerKind = 'warning' | 'error' | 'info';

const bannerStyles: Record<BannerKind, { bg: string; border: string; icon: IconDefinition }> = {
  warning: { bg: palette.warningBg, border: palette.warningBorder, icon: faTriangleExclamation },
  error: { bg: '#FDECEA', border: '#F2A9A2', icon: faExclamation },
  info: { bg: palette.infoBg, border: palette.infoBorder, icon: faCircleInfo },
};

export function Banner({ kind, children }: { kind: BannerKind; children: ReactNode }) {
  const s = bannerStyles[kind];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        bgcolor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '8px',
        px: 2,
        py: 1.5,
      }}
    >
      <FontAwesomeIcon icon={s.icon} style={{ marginTop: 3, fontSize: 13, color: palette.textPrimary }} />
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}

/** Orange text action with an icon. Tertiary variant is #666. */
export function TextAction({
  icon,
  children,
  onClick,
  tertiary,
  disabled,
}: {
  icon: IconDefinition;
  children: ReactNode;
  onClick?: () => void;
  tertiary?: boolean;
  disabled?: boolean;
}) {
  const color = tertiary ? palette.textSecondary : brand.orange;
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        fontSize: 14,
        fontWeight: 600,
        color: disabled ? palette.greyTrack : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': { textDecoration: disabled ? 'none' : 'underline' },
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
      {children}
    </Box>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h2">{children}</Typography>
      {action}
    </Box>
  );
}

export function InfoTooltip({ title }: { title: string }) {
  return (
    <Tooltip title={title}>
      <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: palette.textSecondary }}>
        <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: 12 }} />
      </Box>
    </Tooltip>
  );
}
