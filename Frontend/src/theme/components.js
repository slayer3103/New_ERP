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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  MuiTableContainer: {
    styleOverrides: {
      root: {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: tokens.tableHeaderBg,
        color: tokens.tableHeaderText,
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `2px solid ${tokens.tableBorder}`,
        whiteSpace: 'nowrap',
        padding: '14px 16px',
      },
      root: {
        borderBottom: `1px solid ${tokens.border}`,
        padding: '12px 16px',
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
