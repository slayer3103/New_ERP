import { Alert, Box } from '@mui/material';

export default function ErrorState({ message, onRetry }) {
  return (
    <Box sx={{ py: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Box
              component="button"
              onClick={onRetry}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'inherit',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Retry
            </Box>
          ) : undefined
        }
      >
        {message || 'Something went wrong. Please try again.'}
      </Alert>
    </Box>
  );
}
