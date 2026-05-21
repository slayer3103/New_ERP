import { Box, Paper, Typography } from '@mui/material';
import { tokens } from '../../theme/paletteTokens';

/**
 * Wrapper card for chart sections.
 * Provides consistent border, padding, title, optional actions slot, and empty-state handling.
 *
 * @param {string}           title     – Chart section title
 * @param {string}           subtitle  – Optional description
 * @param {number}           height    – Chart container height in px (default 380)
 * @param {React.ReactNode}  actions   – Optional slot for toggle buttons or controls
 * @param {React.ReactNode}  children  – The chart content (ResponsiveContainer etc.)
 * @param {boolean}          isEmpty   – Show empty state instead of children
 * @param {string}           emptyText – Text for empty state
 */
export default function ChartCard({
  title,
  subtitle,
  height = 380,
  actions,
  children,
  isEmpty = false,
  emptyText = 'No data available',
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: '16px',
        border: `1px solid ${tokens.tableBorder}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Box>

      {isEmpty ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height,
            color: tokens.textSecondary,
          }}
        >
          <Typography>{emptyText}</Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', minHeight: height, height, flexGrow: 1 }}>
          {children}
        </Box>
      )}
    </Paper>
  );
}
