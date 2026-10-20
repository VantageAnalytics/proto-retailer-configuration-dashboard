import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AppHeader } from './components/AppHeader';

/** Set to false to skip the login screen while working on the dashboard. */
const REQUIRE_LOGIN = true;

export default function App() {
  const [authed, setAuthed] = useState(!REQUIRE_LOGIN);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authed ? (
        <>
          <AppHeader onLogout={() => setAuthed(false)} />
          <Dashboard />
        </>
      ) : (
        <LoginScreen onSuccess={() => setAuthed(true)} />
      )}
    </ThemeProvider>
  );
}
