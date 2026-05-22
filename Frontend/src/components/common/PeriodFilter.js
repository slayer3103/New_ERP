import React from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { tokens } from '../../theme/paletteTokens';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getMonthLabel = (offset) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const getQuarterLabel = (offset) => {
  const d = new Date();
  const currentQuarter = Math.floor(d.getMonth() / 3);
  const totalQuarter = currentQuarter + offset;
  const yearOffset = Math.floor(totalQuarter / 4);
  const q = ((totalQuarter % 4) + 4) % 4;
  const year = d.getFullYear() + yearOffset;
  return `Q${q + 1} ${year}`;
};

const getHalfYearLabel = (offset) => {
  const d = new Date();
  const currentHalf = Math.floor(d.getMonth() / 6);
  const totalHalf = currentHalf + offset;
  const yearOffset = Math.floor(totalHalf / 2);
  const h = ((totalHalf % 2) + 2) % 2;
  const year = d.getFullYear() + yearOffset;
  return `${h === 0 ? 'H1' : 'H2'} ${year} (${h === 0 ? 'Jan–Jun' : 'Jul–Dec'})`;
};

const getYearLabel = (offset) => {
  const year = new Date().getFullYear() + offset;
  return `${year}`;
};

const getPeriodLabel = (period, offset) => {
  switch (period) {
    case 'monthly': return getMonthLabel(offset);
    case 'quarterly': return getQuarterLabel(offset);
    case 'six_months': return getHalfYearLabel(offset);
    case 'yearly': return getYearLabel(offset);
    default: return '';
  }
};

const getPeriodTypeLabel = (period) => {
  switch (period) {
    case 'monthly': return 'Month';
    case 'quarterly': return 'Quarter';
    case 'six_months': return 'Half Year';
    case 'yearly': return 'Year';
    default: return '';
  }
};

const DEFAULT_PERIODS = [
  { value: 'monthly', label: 'Monthly', icon: '📅' },
  { value: 'quarterly', label: 'Quarterly', icon: '📊' },
  { value: 'six_months', label: '6 Months', icon: '📈' },
  { value: 'yearly', label: 'Yearly', icon: '🗓️' },
  { value: 'all', label: 'All Time', icon: '♾️' },
];

/**
 * Shared period-filter UI used across all Sales & Analytics pages.
 *
 * @param {string}   selectedPeriod   – current period value
 * @param {function} onPeriodChange   – (newPeriod) => void
 * @param {number}   periodOffset     – navigation offset (0 = current, -1 = previous, etc.)
 * @param {function} onOffsetChange   – (newOffset) => void
 * @param {Array}    [periods]        – override default period options
 */
export default function PeriodFilter({
  selectedPeriod,
  onPeriodChange,
  periodOffset,
  onOffsetChange,
  periods = DEFAULT_PERIODS,
}) {
  const isAllTime = selectedPeriod === 'all';

  return (
    <>
      {/* ─── Segmented Pill Tabs ─── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: '14px',
          mb: 3,
          border: `1px solid ${tokens.tableBorder}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            bgcolor: tokens.surfaceSubtle,
            borderRadius: '10px',
            p: 0.5,
          }}
        >
          {periods.map((p) => (
            <Button
              key={p.value}
              onClick={() => {
                onPeriodChange(p.value);
                if (p.value === 'all') onOffsetChange(0);
              }}
              sx={{
                flex: { xs: '1 1 45%', sm: '1 1 auto' },
                borderRadius: '8px',
                px: { xs: 2, sm: 3 },
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                minWidth: 0,
                bgcolor: selectedPeriod === p.value ? tokens.primary : 'transparent',
                color: selectedPeriod === p.value ? '#fff' : tokens.textSecondary,
                boxShadow: selectedPeriod === p.value ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: selectedPeriod === p.value ? tokens.primaryHover : tokens.surfaceHover,
                },
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}
              startIcon={<span style={{ fontSize: '14px' }}>{p.icon}</span>}
            >
              {p.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* ─── Period Navigation (hidden for All Time) ─── */}
      {!isAllTime && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: '14px',
            mb: 3,
            border: `1px solid ${tokens.tableBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          <IconButton
            onClick={() => onOffsetChange(periodOffset - 1)}
            sx={{
              bgcolor: tokens.surfaceHover,
              '&:hover': { bgcolor: tokens.tableBorder },
              width: 40,
              height: 40,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ textAlign: 'center', minWidth: { xs: 160, sm: 220 } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
            >
              {getPeriodTypeLabel(selectedPeriod)}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>
              {getPeriodLabel(selectedPeriod, periodOffset)}
            </Typography>
          </Box>
          <IconButton
            onClick={() => onOffsetChange(periodOffset + 1)}
            disabled={periodOffset >= 0}
            sx={{
              bgcolor: periodOffset >= 0 ? tokens.surfaceSubtle : tokens.surfaceHover,
              '&:hover': { bgcolor: tokens.tableBorder },
              width: 40,
              height: 40,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          {periodOffset !== 0 && (
            <Button
              size="small"
              onClick={() => onOffsetChange(0)}
              sx={{ textTransform: 'none', fontWeight: 600, color: tokens.primary, ml: 1 }}
            >
              Current
            </Button>
          )}
        </Paper>
      )}
    </>
  );
}
