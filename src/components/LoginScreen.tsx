import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { cardShadow, palette } from '../theme';
import { Banner } from './ui';

const USERNAME = 'vantage';
const PASSWORD = 'pr0t0type3!';

/**
 * Inputs use non-standard name/id attributes plus autocomplete="off" and
 * data-1p-ignore so password managers don't offer to fill this prototype.
 */
const ignoreManagers = {
  autoComplete: 'off',
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const;

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (user === USERNAME && pass === PASSWORD) onSuccess();
    else setError(true);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3,
      }}
    >
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          width: 420,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: cardShadow,
          p: 4,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: 28 }}>
          Vantage
        </Typography>
        <Typography variant="body2" sx={{ color: palette.textSecondary, mt: 1 }}>
          Retailer Configuration Dashboard prototype
        </Typography>

        <Box sx={{ mt: '36px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Banner kind="error">That username or password isn't right. Try again.</Banner>}

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }} component="label" htmlFor="vc-operator">
              Username
            </Typography>
            <TextField
              id="vc-operator"
              name="vc-operator"
              fullWidth
              size="small"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setError(false);
              }}
              slotProps={{ htmlInput: ignoreManagers }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }} component="label" htmlFor="vc-secret">
              Password
            </Typography>
            <TextField
              id="vc-secret"
              name="vc-secret"
              type="password"
              fullWidth
              size="small"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError(false);
              }}
              slotProps={{ htmlInput: { ...ignoreManagers, autoComplete: 'new-password' } }}
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1, py: 1.25 }}>
            Sign in
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
