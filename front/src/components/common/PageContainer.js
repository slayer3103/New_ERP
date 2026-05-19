import { Box } from '@mui/material';

export default function PageContainer({ children, sx = {} }) {
  return (
    <Box
      component="div"
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        overflow: 'auto',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
