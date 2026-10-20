import type { ReactNode } from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faClock,
  faExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { brand, palette } from '../theme';
import type { CapabilityStatus } from '../types';

type ChipTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

/**
 * Chip geometry from the design system: small size is a 24px fully rounded pill
 * with a 1px border, a 14px regular label, and a 6px gap before the leading icon.
 * Tinted tones keep ink text; only Error is a solid fill with a white label.
 */
const chipTones: Record<ChipTone, { bg: string; border: string; color: string }> = {
  neutral: { bg: palette.pillBg, border: palette.border, color: palette.textPrimary },
  success: { bg: palette.successBg, border: palette.successBorder, color: palette.textPrimary },
  warning: { bg: palette.amberBg, border: palette.warningBorder, color: palette.textPrimary },
  error: { bg: palette.errorBg, border: palette.errorBg, color: '#FFFFFF' },
  info: { bg: palette.infoBg, border: palette.infoBorder, color: palette.textPrimary },
};

/** Sizes keep the design system's proportions; inline chips use the compact one. */
const chipSizes = {
  compact: { height: 20, fontSize: 12, icon: 11, gap: '5px', padIcon: '6px', pad: '8px' },
  small: { height: 24, fontSize: 14, icon: 13, gap: '6px', padIcon: '7px', pad: '10px' },
} as const;

/** Label collapse/expand timing, shared by every property the collapse animates. */
const collapseTransition = '160ms ease';

export function Chip({
  children,
  tone = 'neutral',
  size = 'compact',
  icon,
  iconColor,
  title,
  collapsed,
}: {
  children: ReactNode;
  tone?: ChipTone;
  size?: keyof typeof chipSizes;
  icon?: IconDefinition;
  iconColor?: string;
  title?: string;
  /** Set to render icon-only until expanded. Requires an icon to stay legible. */
  collapsed?: boolean;
}) {
  const t = chipTones[tone];
  const s = chipSizes[size];
  const collapsible = collapsed !== undefined;
  const chip = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: collapsible ? 0 : s.gap,
        height: s.height,
        // Collapsed chips drop the fill and keep a transparent border, so the bare
        // icon sits flush and the pill grows back without shifting the row.
        bgcolor: collapsed ? 'transparent' : t.bg,
        border: '1px solid',
        borderColor: collapsed ? 'transparent' : t.border,
        color: t.color,
        fontSize: s.fontSize,
        fontWeight: 400,
        lineHeight: 1,
        borderRadius: '999px',
        pl: collapsed ? 0 : icon ? s.padIcon : s.pad,
        pr: collapsed ? 0 : s.pad,
        whiteSpace: 'nowrap',
        cursor: title ? 'help' : 'default',
        flexShrink: 0,
        transition: `padding-left ${collapseTransition}, padding-right ${collapseTransition}, background-color ${collapseTransition}, border-color ${collapseTransition}`,
      }}
    >
      {icon && <FontAwesomeIcon icon={icon} style={{ fontSize: s.icon, color: iconColor ?? 'inherit' }} />}
      {collapsible ? (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            overflow: 'hidden',
            maxWidth: collapsed ? 0 : 120,
            opacity: collapsed ? 0 : 1,
            ml: collapsed ? 0 : s.gap,
            transition: `max-width ${collapseTransition}, opacity ${collapseTransition}, margin-left ${collapseTransition}`,
          }}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
  return title ? <Tooltip title={title}>{chip}</Tooltip> : chip;
}

/** Clarifying chip next to a label. */
export function Pill({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Chip title={title}>{children}</Chip>
  );
}

export function SuccessPill({ children, collapsed }: { children: ReactNode; collapsed?: boolean }) {
  return (
    <Chip tone="success" icon={faCircleCheck} iconColor={palette.successCircle} collapsed={collapsed}>
      {children}
    </Chip>
  );
}

export function ErrorPill({ children }: { children: ReactNode }) {
  return (
    <Chip tone="error" icon={faCircleExclamation}>
      {children}
    </Chip>
  );
}

export function PendingPill({
  children = 'Pending approval',
  collapsed,
}: {
  children?: ReactNode;
  collapsed?: boolean;
}) {
  return (
    <Chip tone="warning" icon={faClock} iconColor={palette.amber} collapsed={collapsed}>
      {children}
    </Chip>
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
      <Chip tone="warning" icon={faTriangleExclamation} iconColor={palette.amber}>
        Incomplete
      </Chip>
    );
  return <Pill>{statusLabels[status]}</Pill>;
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
  const color = tertiary ? palette.textSecondary : brand.periwinkleDark;
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
      <Typography variant="h4" sx={{ color: palette.textSecondary }}>
        {children}
      </Typography>
      {action}
    </Box>
  );
}

/** Sticky footer on a card with unsaved edits. Sits flush with the card edges. */
export function UnsavedBar({
  count,
  onDiscard,
  onSave,
}: {
  count: number;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        mt: 3,
        mx: -3,
        mb: -3,
        px: 3,
        py: 2,
        bgcolor: brand.periwinkleTint,
        borderTop: `1px solid ${brand.periwinkleLight}`,
        borderRadius: '0 0 8px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {count} unsaved change{count === 1 ? '' : 's'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={onDiscard} sx={{ color: palette.textSecondary }}>
          Discard
        </Button>
        <Button variant="contained" onClick={onSave}>
          Save changes
        </Button>
      </Box>
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
