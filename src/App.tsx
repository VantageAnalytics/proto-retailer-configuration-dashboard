import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { AppHeader } from './components/AppHeader';

/** Set to true to show the login screen again. The screen itself still works. */
const REQUIRE_LOGIN = false;

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
