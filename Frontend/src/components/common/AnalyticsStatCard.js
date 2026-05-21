import { Box, Card, CardContent, Typography } from '@mui/material';

/**
 * Premium stat card for analytics pages.
 * Replaces 7+ inline StatCard definitions across the codebase.
 *
 * @param {string}           title    – Label below the value
 * @param {string|number}    value    – The main metric
 * @param {React.ReactNode}  icon     – MUI icon element (already styled with fontSize/color)
 * @param {string}           color    – Accent hex color
 * @param {string}           subtitle – Optional small text below the title
 * @param {string}           trend    – Optional trend label (e.g., "+12%")
 */
export default function AnalyticsStatCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
        border: `1px solid ${color}18`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 28px -8px ${color}30`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: `${color}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: `${color}12`,
                color: color,
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {trend}
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color,
            mb: 0.5,
            fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.85rem' },
            wordBreak: 'break-word',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block', lineHeight: 1.4 }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
