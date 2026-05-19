import { useEffect, useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../../theme/paletteTokens';

export default function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  width = { xs: '100%', sm: 220 },
  sx = {},
}) {
  const [internal, setInternal] = useState(value || '');

  useEffect(() => {
    setInternal(value || '');
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0) {
      onChange(internal);
      return undefined;
    }
    const timer = setTimeout(() => onChange(internal), debounceMs);
    return () => clearTimeout(timer);
  }, [internal, debounceMs, onChange]);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        border: `1px solid ${tokens.border}`,
        bgcolor: tokens.mutedSurface,
        width,
        ...sx,
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: tokens.textSecondary }} />
      <InputBase
        placeholder={placeholder}
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        sx={{
          ml: 1,
          flex: 1,
          fontSize: 13,
          '& input::placeholder': { color: tokens.textSecondary, opacity: 1 },
        }}
      />
      {internal && (
        <IconButton size="small" onClick={() => { setInternal(''); onChange(''); }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Paper>
  );
}
