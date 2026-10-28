import { useState } from 'react';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faCheck,
  faGear,
  faList,
  faTableCellsLarge,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';
import type { Layout } from './Dashboard';

const layoutOptions: { id: Layout; label: string; description: string; icon: IconDefinition }[] = [
  { id: 'list', label: 'List layout', description: 'Every card stacked in one column', icon: faList },
  { id: 'cards', label: 'Card layout', description: 'Small cards above one expanded card', icon: faTableCellsLarge },
];

/** White bar with the Vantage logo on the left and the layout menu and logout on the right. */
export function AppHeader({
  onLogout,
  layout,
  onLayoutChange,
}: {
  onLogout: () => void;
  layout: Layout;
  onLayoutChange: (next: Layout) => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  function choose(next: Layout) {
    setMenuAnchor(null);
    if (next !== layout) onLayoutChange(next);
  }

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
            aria-haspopup="menu"
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

          <Menu
            id="layout-menu"
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 260 } } }}
          >
            {layoutOptions.map((option) => {
              const selected = option.id === layout;
              return (
                <MenuItem key={option.id} selected={selected} onClick={() => choose(option.id)}>
                  <ListItemIcon sx={{ color: selected ? brand.periwinkleDark : palette.textSecondary }}>
                    <FontAwesomeIcon icon={option.icon} style={{ fontSize: 14 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={option.label}
                    secondary={option.description}
                    slotProps={{
                      primary: { sx: { fontSize: 14, fontWeight: selected ? 600 : 400 } },
                      secondary: { sx: { fontSize: 12 } },
                    }}
                  />
                  {selected && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ fontSize: 12, color: brand.periwinkleDark, marginLeft: 12 }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </Menu>

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
