import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { brand, palette } from '../theme';

/** White bar with the Vantage logo on the left and a logout action on the right. */
export function AppHeader({ onLogout }: { onLogout: () => void }) {
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
  );
}
