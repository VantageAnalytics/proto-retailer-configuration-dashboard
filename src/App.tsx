import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard, type Layout } from './components/Dashboard';
import { AppHeader } from './components/AppHeader';

/** Set to false to skip the login screen while working on the dashboard. */
const REQUIRE_LOGIN = true;

/**
 * Cursor's built-in browser runs an Electron shell and says so in its user agent,
 * which no ordinary browser does. Previews there start signed in so iterating on
 * the dashboard isn't gated behind the login every reload. Logout still works.
 */
function isBuiltInBrowser(): boolean {
  return /\b(?:Cursor|Electron)\/\d/.test(navigator.userAgent);
}

export default function App() {
  const [authed, setAuthed] = useState(!REQUIRE_LOGIN || isBuiltInBrowser());
  const [layout, setLayout] = useState<Layout>('list');
  const [separateHistory, setSeparateHistory] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authed ? (
        <>
          <AppHeader
            onLogout={() => setAuthed(false)}
            layout={layout}
            onLayoutChange={setLayout}
            separateHistory={separateHistory}
            onSeparateHistoryChange={setSeparateHistory}
          />
          <Dashboard layout={layout} separateHistory={separateHistory} />
        </>
      ) : (
        <LoginScreen onSuccess={() => setAuthed(true)} />
      )}
    </ThemeProvider>
  );
}
