import { Box, Paper, Typography } from '@mui/material';
import { tokens } from '../../theme/paletteTokens';

export default function StatCard({ icon, label, value, accentColor }) {
  const color = accentColor || tokens.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        height: '100%',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}14`,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: tokens.textSecondary,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: tokens.textPrimary,
            mt: 0.5,
            lineHeight: 1.2,
          }}
        >
          {value ?? '—'}
        </Typography>
      </Box>
    </Paper>
  );
}
