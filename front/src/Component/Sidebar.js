import {
  Box,
  Typography,
  Drawer,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import ui from '../assets/ui.png';
import { navSections, DRAWER_WIDTH } from '../config/navigation';
import { tokens } from '../theme/paletteTokens';

const isPathActive = (pathname, matchPaths) =>
  matchPaths.some((path) => {
    const normalized = path.toLowerCase();
    const current = pathname.toLowerCase();
    return current === normalized || current.startsWith(`${normalized}/`);
  });

const ListSection = ({ title, items, location, onNavigate }) => {
  const userRole = localStorage.getItem('userRole');
  const filteredItems = items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <>
      <Typography
        sx={{
          mt: 2.5,
          mb: 1,
          pl: 2,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: tokens.sidebarTextMuted,
        }}
      >
        {title}
      </Typography>
      {filteredItems.map((item) => {
        const isActive = isPathActive(location.pathname, item.matchPaths);
        const IconComponent = item.icon;

        return (
          <NavLink
            to={item.path}
            key={item.text}
            style={{ textDecoration: 'none' }}
            onClick={onNavigate}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mx: 1,
                mb: 0.5,
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: isActive ? tokens.primary : 'transparent',
                color: isActive ? '#fff' : tokens.sidebarText,
                transition: 'background-color 0.15s ease, color 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? tokens.primary : tokens.sidebarHover,
                  color: isActive ? '#fff' : '#E2E8F0',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: 'inherit',
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}
              >
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </Box>
          </NavLink>
        );
      })}
    </>
  );
};

const drawerContent = (location, onNavigate) => (
  <>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 64,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      <img
        src={ui}
        alt="Logo"
        style={{
          maxHeight: 40,
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: 'brightness(0) invert(1)',
          opacity: 0.95,
        }}
      />
    </Box>
    <Box
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        py: 1,
        px: 0.5,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '4px',
        },
      }}
    >
      {navSections.map((section) => (
        <ListSection
          key={section.title}
          title={section.title}
          items={section.items}
          location={location}
          onNavigate={onNavigate}
        />
      ))}
    </Box>
  </>
);

const Sidebar = ({ mobileOpen = false, onClose, isMobile = false }) => {
  const location = useLocation();

  const handleNavigate = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const paperStyles = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    bgcolor: tokens.sidebarBg,
    color: tokens.sidebarText,
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': paperStyles,
        }}
      >
        {drawerContent(location, handleNavigate)}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': paperStyles,
      }}
    >
      {drawerContent(location, handleNavigate)}
    </Drawer>
  );
};

export default Sidebar;
