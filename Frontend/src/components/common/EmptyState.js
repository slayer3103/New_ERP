import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({
  image,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        py: { xs: 6, md: 8 },
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {image && (
        <Box
          component="img"
          src={image}
          alt=""
          sx={{ width: 200, maxWidth: '100%', mb: 3, opacity: 0.9 }}
        />
      )}
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" sx={{ mt: 3, textTransform: 'none', px: 3 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
