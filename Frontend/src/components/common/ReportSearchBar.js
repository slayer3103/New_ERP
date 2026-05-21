import { Box, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../../theme/paletteTokens';

/**
 * Standardized search input for report/analytics pages.
 *
 * @param {string}   value       – Current search text
 * @param {function} onChange    – Called with the raw event
 * @param {string}   placeholder – Input placeholder text
 */
export default function ReportSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: tokens.surfaceSubtle,
        border: `1px solid ${tokens.tableBorder}`,
        borderRadius: '12px',
        px: 2,
        py: 1,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:focus-within': {
          borderColor: tokens.primary,
          boxShadow: `0 0 0 3px ${tokens.primary}18`,
        },
      }}
    >
      <SearchIcon fontSize="small" sx={{ color: tokens.textSecondary, mr: 1.5, flexShrink: 0 }} />
      <InputBase
        placeholder={placeholder}
        fullWidth
        value={value}
        onChange={onChange}
        sx={{
          fontSize: '0.875rem',
          '& input::placeholder': {
            color: tokens.textSecondary,
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}
