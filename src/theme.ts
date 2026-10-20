import { createTheme } from '@mui/material/styles';

/**
 * Vantage brand colors. Ink, Eucalyptus, Poppy, Periwinkle and Pearl are the five
 * published primaries; the dark/light/tint steps are derived from them because the
 * brand sheet only specifies the base values. Swap these to retheme the prototype.
 */
export const brand = {
  ink: '#0F0737',
  eucalyptus: '#59C69C',
  poppy: '#FE5931',
  periwinkle: '#97B9FF',
  pearl: '#FAFFF9',
  /**
   * Periwinkle is the accent. The base is too light to carry text, so accent text
   * and icons use periwinkleDark; light and tint are the border and fill steps.
   */
  periwinkleDark: '#3457B5',
  periwinkleLight: '#C7D9FF',
  periwinkleTint: '#EFF4FF',
};

export const palette = {
  textPrimary: brand.ink,
  textSecondary: '#5C5670',
  border: '#E2E0E8',
  pillBg: '#F2F1F6',
  successBg: '#E9F8F1',
  successBorder: '#A7E0C7',
  successText: '#1F6B4D',
  successCircle: '#2E9E74',
  errorBg: '#D32F2F',
  errorText: '#B3261E',
  warningBg: '#FFF0E1',
  warningBorder: '#F0B27A',
  infoBg: '#EEF3FF',
  infoBorder: brand.periwinkle,
  amber: '#B26A00',
  amberBg: '#FFF4E0',
  greyTrack: '#B9B5C6',
};

export const cardShadow = '2px 2px 15px rgba(0,0,0,0.14)';

export const theme = createTheme({
  shape: { borderRadius: 8 },
  palette: {
    // Ink label, not white: Periwinkle is light enough that white text on it fails contrast.
    primary: { main: brand.periwinkle, dark: '#7CA4F7', contrastText: brand.ink },
    text: { primary: palette.textPrimary, secondary: palette.textSecondary },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    // One descending ramp: page 28 > card 20 > card section 16 > field group 14 > body 14.
    // The field group shares body size, so it separates from field labels on weight and color.
    h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: 20, fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: 16, fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: 14, fontWeight: 700, lineHeight: 1.4 },
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
