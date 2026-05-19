import { createTheme } from '@mui/material/styles';
import { tokens } from './paletteTokens';
import components from './components';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.primary,
      dark: tokens.primaryHover,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.textSecondary,
    },
    success: {
      main: tokens.success,
    },
    warning: {
      main: tokens.warning,
    },
    error: {
      main: tokens.danger,
    },
    background: {
      default: tokens.pageBg,
      paper: tokens.card,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    divider: tokens.border,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: tokens.textPrimary,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      color: tokens.textPrimary,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      color: tokens.textPrimary,
    },
    subtitle2: {
      fontWeight: 600,
      color: tokens.textSecondary,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    body2: {
      color: tokens.textSecondary,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components,
  // Custom tokens accessible via theme tokens if needed
  tokens,
});

export default theme;
