import { createTheme } from '@mui/material/styles';

/**
 * HD theme values. The design-tokens repo wasn't reachable when this prototype was
 * built, so the orange ramp below is the Home Depot brand orange and its tints.
 * Swap these four constants to retheme the whole prototype.
 */
export const brand = {
  orange: '#F96302',
  orangeDark: '#D45400',
  orangeLight: '#FDDBC4',
  orangeTint: '#FFF4EC',
};

export const palette = {
  textPrimary: '#1D1D1D',
  textSecondary: '#666666',
  border: '#E0E0E0',
  pillBg: '#F5F5F5',
  successBg: '#EDF7ED',
  successBorder: '#A5D6A7',
  successText: '#1E5C24',
  successCircle: '#2E7D32',
  errorBg: '#D32F2F',
  errorText: '#B3261E',
  warningBg: '#FFF0E1',
  warningBorder: '#F0B27A',
  infoBg: '#E8F1FB',
  infoBorder: '#9EC3E8',
  amber: '#B26A00',
  amberBg: '#FFF4E0',
  greyTrack: '#BDBDBD',
};

export const cardShadow = '2px 2px 15px rgba(0,0,0,0.14)';

export const theme = createTheme({
  shape: { borderRadius: 8 },
  palette: {
    primary: { main: brand.orange, dark: brand.orangeDark, contrastText: '#FFFFFF' },
    text: { primary: palette.textPrimary, secondary: palette.textSecondary },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    // Page title 28, section heading 16, body 14, nothing under 12.
    h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: 16, fontWeight: 700, lineHeight: 1.4 },
    h3: { fontSize: 16, fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: 14, lineHeight: 1.5 },
    body2: { fontSize: 14, lineHeight: 1.5 },
    caption: { fontSize: 12, lineHeight: 1.4 },
    button: { fontSize: 14, fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, cursor: 'pointer', paddingInline: 16 },
      },
    },
    MuiTooltip: {
      defaultProps: { enterDelay: 0, enterTouchDelay: 0, enterNextDelay: 0 },
      styleOverrides: {
        tooltip: {
          fontSize: 14,
          color: palette.textSecondary,
          backgroundColor: '#FFFFFF',
          border: `1px solid ${palette.border}`,
          boxShadow: cardShadow,
          maxWidth: 280,
          padding: '8px 12px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 14, backgroundColor: '#FFFFFF' },
        input: { padding: '10px 12px' },
      },
    },
    MuiSelect: { styleOverrides: { select: { padding: '10px 12px' } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: 12, marginLeft: 0 } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 14 } } },
    MuiIconButton: { styleOverrides: { root: { cursor: 'pointer' } } },
  },
});
