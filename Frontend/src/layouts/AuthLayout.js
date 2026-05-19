import { Box } from '@mui/material';
import { tokens } from '../theme/paletteTokens';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: tokens.pageBg,
        backgroundImage: `radial-gradient(ellipse at 20% 0%, ${tokens.primary}12 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, ${tokens.primary}08 0%, transparent 45%)`,
        px: 2,
        py: 4,
      }}
    >
      {children}
    </Box>
  );
}
