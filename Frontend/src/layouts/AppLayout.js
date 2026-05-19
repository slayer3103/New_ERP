import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from '../Component/Sidebar';
import TopNav from '../components/common/TopNav';
import PageContainer from '../components/common/PageContainer';
import { tokens } from '../theme/paletteTokens';
import { DRAWER_WIDTH } from '../config/navigation';

export default function AppLayout({ title, actions, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.pageBg }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <TopNav
          title={title}
          actions={actions}
          onMenuToggle={() => setMobileOpen(true)}
          showMenuButton={isMobile}
        />
        <PageContainer>{children}</PageContainer>
      </Box>
    </Box>
  );
}
