import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [authed, setAuthed] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authed ? <Dashboard /> : <LoginScreen onSuccess={() => setAuthed(true)} />}
    </ThemeProvider>
  );
}
