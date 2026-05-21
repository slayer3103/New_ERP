import { Box, Paper, Typography } from '@mui/material';

/**
 * Reusable hero/banner header for every report/analytics page.
 *
 * @param {string}  title          – Main heading text
 * @param {string}  subtitle       – Description text below heading
 * @param {string}  gradientStart  – CSS color for gradient start (default: slate-800)
 * @param {string}  gradientEnd    – CSS color for gradient end   (default: slate-600)
 * @param {React.ReactNode} icon   – Optional MUI icon component rendered as background watermark
 */
export default function ReportPageHeader({
  title,
  subtitle,
  gradientStart = '#1E293B',
  gradientEnd = '#334155',
  icon: IconComponent,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 },
        mb: 3,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mb: 0.5,
            color: 'white',
            fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.85,
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
      {IconComponent && (
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -20, md: -30 },
            top: { xs: -20, md: -30 },
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        >
          <IconComponent sx={{ fontSize: { xs: 120, md: 180 } }} />
        </Box>
      )}
    </Paper>
  );
}
