import { Chip } from '@mui/material';
import { tokens } from '../../theme/paletteTokens';

const STATUS_STYLES = {
  active: { bgcolor: `${tokens.success}18`, color: tokens.success },
  inactive: { bgcolor: `${tokens.danger}18`, color: tokens.danger },
  paid: { bgcolor: `${tokens.success}18`, color: tokens.success },
  partial: { bgcolor: `${tokens.warning}18`, color: tokens.warning },
  draft: { bgcolor: `${tokens.mutedSurface}`, color: tokens.textSecondary },
  completed: { bgcolor: `${tokens.success}18`, color: tokens.success },
  sent: { bgcolor: `${tokens.primary}18`, color: tokens.primary },
  default: { bgcolor: tokens.mutedSurface, color: tokens.textSecondary },
};

const resolveStyle = (status) => {
  const key = (status || '').toLowerCase().replace(/\s+/g, '');
  if (key.includes('active') && !key.includes('inactive')) return STATUS_STYLES.active;
  if (key.includes('inactive')) return STATUS_STYLES.inactive;
  if (key.includes('paid')) return STATUS_STYLES.paid;
  if (key.includes('partial')) return STATUS_STYLES.partial;
  if (key.includes('draft')) return STATUS_STYLES.draft;
  if (key.includes('complete')) return STATUS_STYLES.completed;
  if (key.includes('sent')) return STATUS_STYLES.sent;
  return STATUS_STYLES.default;
};

export default function StatusChip({ status, size = 'small', sx = {} }) {
  const style = resolveStyle(status);
  return (
    <Chip
      label={status || '—'}
      size={size}
      sx={{
        ...style,
        fontWeight: 600,
        fontSize: '0.7rem',
        border: 'none',
        ...sx,
      }}
    />
  );
}
