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
  Chip,
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NumbersIcon from '@mui/icons-material/Numbers';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
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
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4, borderRadius: '20px', mb: 4,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <SettingsIcon sx={{ fontSize: 26 }} />
            <Typography variant="h5" fontWeight="bold">
              {isEditMode ? 'Edit Financial Year Settings' : 'Financial Year Settings'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 520 }}>
            Configure financial year dates, document numbering series, and terms & conditions for invoices and purchase orders.
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.06 }}>
          <SettingsIcon sx={{ fontSize: 200 }} />
        </Box>
      </Paper>

      {/* Financial Year Details */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditMode && (
              <IconButton size="small" onClick={handleCancel} sx={{ color: '#64748b' }}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight="bold" color="#1e293b">
              Year Configuration
            </Typography>
          </Box>
          {!isEditMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                borderColor: '#cbd5e1',
                color: '#475569',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              Edit
            </Button>
          )}
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Financial Year Name"
              defaultValue="FY 2025-26"
              InputProps={{ readOnly: !isEditMode }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Document Numbering Series */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#ede9fe', display: 'flex' }}>
            <NumbersIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            Document Numbering Series
          </Typography>
          <Tooltip title="The series number will be reset per financial year">
            <IconButton size="small" sx={{ color: '#94a3b8' }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2.5}>
          {[
            { label: 'Invoice Series', defaultValue: 'ME-000001', color: '#3b82f6' },
            { label: 'PO Series', defaultValue: 'PO-000001', color: '#10b981' },
            { label: 'WO Series', defaultValue: 'WO-000001', color: '#f59e0b' },
            { label: 'Proforma Invoice Series', defaultValue: 'PINV-000001', color: '#8b5cf6' },
          ].map((field, index) => (
            <Grid key={index} item xs={12} md={3}>
              <Box sx={{ mb: 0.5 }}>
                <Chip
                  label={field.label}
                  size="small"
                  sx={{
                    mb: 1,
                    bgcolor: `${field.color}10`,
                    color: field.color,
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '6px',
                  }}
                />
              </Box>
              <TextField
                fullWidth
                required
                defaultValue={field.defaultValue}
                InputProps={{ readOnly: !isEditMode }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: isEditMode ? '#fff' : '#f8fafc',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Terms & Conditions */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#dbeafe', display: 'flex' }}>
            <DescriptionIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            Terms & Conditions
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
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
                multiline
                minRows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: isEditMode ? '#fff' : '#f8fafc',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Actions */}
      {isEditMode && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={handleCancel}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                px: 3,
                fontWeight: 600,
                borderColor: '#cbd5e1',
                color: '#475569',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                px: 3,
                fontWeight: 'bold',
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}
    </AppLayout>
  );
};

export default FinancialYearSettings;
