import { tokens } from './paletteTokens';

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: tokens.pageBg,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 8,
      },
      containedPrimary: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
          backgroundColor: tokens.primaryHover,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${tokens.border}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      elevation0: {
        boxShadow: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${tokens.border}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: tokens.mutedSurface,
        color: tokens.textSecondary,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `1px solid ${tokens.border}`,
      },
      root: {
        borderBottom: `1px solid ${tokens.border}`,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: 6,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        border: 'none',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

export default components;
