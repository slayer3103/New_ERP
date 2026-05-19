import { Box, Typography, Chip } from '@mui/material';
import { tokens } from '../../theme/paletteTokens';

export default function PageHeader({ title, count, children, sx = {} }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
          {title}
        </Typography>
        {count !== undefined && (
          <Chip
            label={count}
            size="small"
            sx={{
              bgcolor: `${tokens.primary}14`,
              color: tokens.primary,
              fontWeight: 700,
              height: 24,
            }}
          />
        )}
      </Box>
      {children && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
