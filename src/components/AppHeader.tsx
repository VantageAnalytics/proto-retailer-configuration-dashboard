import { useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Popover,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faGear,
  faList,
  faTableCellsLarge,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import type { Layout } from './Dashboard';

const layoutOptions: { id: Layout; label: string; icon: IconDefinition }[] = [
  { id: 'list', label: 'List', icon: faList },
  { id: 'cards', label: 'Cards', icon: faTableCellsLarge },
];

/** White bar with the Vantage logo on the left and the layout menu and logout on the right. */
export function AppHeader({
  onLogout,
  layout,
  onLayoutChange,
  separateHistory,
  onSeparateHistoryChange,
}: {
  onLogout: () => void;
  layout: Layout;
  onLayoutChange: (next: Layout) => void;
  separateHistory: boolean;
  onSeparateHistoryChange: (next: boolean) => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);
  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      <Box
        sx={{
          maxWidth: 1920,
          minWidth: 1280,
          mx: 'auto',
          px: 4,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box component="img" src="/vantage-logo.png" alt="Vantage" sx={{ height: 32, display: 'block' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
            aria-label="Page layout"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'layout-menu' : undefined}
            sx={{
              width: 32,
              height: 32,
              color: menuOpen ? brand.periwinkleDark : palette.textSecondary,
              bgcolor: menuOpen ? brand.periwinkleTint : 'transparent',
              '&:hover': { bgcolor: menuOpen ? brand.periwinkleTint : palette.pillBg },
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ fontSize: 16 }} />
          </IconButton>

          <Popover
            id="layout-menu"
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { role: 'dialog', 'aria-label': 'Page settings', sx: { mt: 1, width: 300, p: 2 } } }}
          >
            <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
              Layout
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={layout}
              onChange={(_, next: Layout | null) => {
                if (next) onLayoutChange(next);
              }}
              aria-label="Page layout"
              sx={{ mt: 1 }}
            >
              {layoutOptions.map((option) => (
                <ToggleButton
                  key={option.id}
                  value={option.id}
                  sx={{
                    gap: 1,
                    textTransform: 'none',
                    fontSize: 14,
                    '&.Mui-selected, &.Mui-selected:hover': {
                      color: brand.periwinkleDark,
                      bgcolor: brand.periwinkleTint,
                      fontWeight: 600,
                    },
                  }}
                >
                  <FontAwesomeIcon icon={option.icon} style={{ fontSize: 13 }} />
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Divider sx={{ my: 2, mx: -2 }} />

            <Box
              component="label"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, cursor: 'pointer' }}
            >
              <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
                Separate change history
              </Typography>
              <Switch
                size="small"
                checked={separateHistory}
                onChange={(e) => onSeparateHistoryChange(e.target.checked)}
                sx={{ flexShrink: 0 }}
              />
            </Box>
          </Popover>

          <Box
            component="button"
            type="button"
            onClick={onLogout}
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
              color: brand.eucalyptus,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: 14 }} />
            Logout
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
