import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Paper,
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AppLayout from '../layouts/AppLayout';

const statusOptions = ['Active', 'Inactive'];

const FinancialYearSettings = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEdit = () => setIsEditMode(true);
  const handleCancel = () => setIsEditMode(false);
  const handleSave = () => {
  
    setIsEditMode(false);
  };

  return (
    <AppLayout title="Financial Year Settings">
          <Paper elevation={0} sx={{ p: 4, borderRadius: '12px' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              {isEditMode && <ArrowBackIosNewIcon fontSize="small" />}
              <Typography variant="h6" fontWeight="bold">
                {isEditMode ? 'Edit Financial Year Settings' : 'Financial Year Settings'}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Financial Year Name"
                  defaultValue="FY 2025-26"
                  InputProps={{ readOnly: !isEditMode }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Start Date"
                  type="date"
                  defaultValue="2025-04-01"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: !isEditMode }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="End Date"
                  type="date"
                  defaultValue="2026-03-31"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: !isEditMode }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Status"
                  defaultValue="Active"
                  disabled={!isEditMode}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box mt={5}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
              >
                Document Numbering Series
                <Tooltip title="The series number will be reset per financial year">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>

              <Grid container spacing={2}>
                {[
                  { label: 'Invoice Series', defaultValue: 'ME-000001' },
                  { label: 'PO Series', defaultValue: 'PO-000001' },
                  { label: 'WO Series', defaultValue: 'WO-000001' },
                  { label: 'Proforma Invoice Series', defaultValue: 'PINV-000001' },
                ].map((field, index) => (
                  <Grid key={index} item xs={12} md={3}>
                    <TextField
                      fullWidth
                      required
                      label={field.label}
                      defaultValue={field.defaultValue}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box mt={5}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Terms & Conditions
              </Typography>
              <Grid container spacing={2}>
                {[
                  'Invoice Terms & Conditions',
                  'PO & Conditions',
                  'WO Terms & Conditions',
                  'Proforma Invoice Terms & Conditions',
                ].map((label, idx) => (
                  <Grid item xs={12} key={idx}>
                    <TextField
                      fullWidth
                      label={label}
                      placeholder="Type your terms & conditions"
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box
              mt={4}
              display="flex"
              justifyContent="flex-end"
              gap={2}
              sx={{ borderTop: '1px solid #eee', pt: 3 }}
            >
              {isEditMode ? (
                <>
                  <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="contained" sx={{ bgcolor: '#003865' }} onClick={handleSave}>
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outlined" onClick={handleEdit}>
                  Edit
                </Button>
              )}
            </Box>
          </Paper>
    </AppLayout>
  );
};

export default FinancialYearSettings;

