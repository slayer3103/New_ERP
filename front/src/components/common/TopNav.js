import {
  Box,
  Typography,
  InputBase,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import UserMenu from '../../Component/UserMenu';
import { tokens } from '../../theme/paletteTokens';

export default function TopNav({ title, actions, onMenuToggle, showMenuButton }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        minHeight: 64,
        borderBottom: `1px solid ${tokens.border}`,
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 3 },
        justifyContent: 'space-between',
        bgcolor: tokens.card,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        {(showMenuButton || isMobile) && onMenuToggle && (
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            sx={{ color: tokens.textSecondary, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h5"
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            color: tokens.textPrimary,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }}>
        {actions}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            bgcolor: tokens.mutedSurface,
            border: `1px solid ${tokens.border}`,
            px: 2,
            py: 0.75,
            borderRadius: 2,
            minWidth: { sm: 200, md: 260 },
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: tokens.textSecondary }} />
          <InputBase
            placeholder="Search..."
            sx={{
              ml: 1,
              flex: 1,
              fontSize: 14,
              '& input::placeholder': { color: tokens.textSecondary, opacity: 1 },
            }}
          />
        </Box>
        <IconButton size="small" sx={{ color: tokens.textSecondary }}>
          <NotificationsNoneIcon />
        </IconButton>
        <UserMenu />
      </Box>
    </Box>
  );
}
