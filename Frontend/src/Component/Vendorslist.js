import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, Pagination, Tabs, Tab,
  IconButton, Menu, MenuItem, Paper, Modal,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/common/PageHeader';
import SearchField from '../components/common/SearchField';
import DataTable from '../components/common/DataTable';
import StatusChip from '../components/common/StatusChip';
import LoadingState from '../components/common/LoadingState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BASE_URL from '../config/api';

export default function VendorListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/vendors`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      console.log('Backend vendor list:', data); // Debug: Log raw backend data
      // Transform flat data to nested structure for frontend
      const transformedData = data.map(vendor => ({
        vendor_id: vendor.id,
        vendor_name: vendor.vendor_name || '',
        company_name: vendor.company_name || '',
        display_name: vendor.display_name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        pan: vendor.pan || '',
        gst: vendor.gst || '',
        status: vendor.status || 'Active',
        billing_address: {
          recipient_name: vendor.billing_recipient_name || '',
          country: vendor.billing_country || '',
          address_line1: vendor.billing_address1 || '',
          address_line2: vendor.billing_address2 || '',
          city: vendor.billing_city || '',
          state: vendor.billing_state || '',
          pincode: vendor.billing_pincode || '',
          fax: vendor.billing_fax || '',
          phone: vendor.billing_phone || ''
        },
        shipping_address: {
          recipient_name: vendor.shipping_recipient_name || '',
          country: vendor.shipping_country || '',
          address_line1: vendor.shipping_address1 || '',
          address_line2: vendor.shipping_address2 || '',
          city: vendor.shipping_city || '',
          state: vendor.shipping_state || '',
          pincode: vendor.shipping_pincode || '',
          fax: vendor.shipping_fax || '',
          phone: vendor.shipping_phone || ''
        },
        bank_details: {
          account_holder_name: vendor.account_holder_name || '',
          bank_name: vendor.bank_name || '',
          account_number: vendor.account_number || '',
          ifsc: vendor.ifsc || ''
        },
        remark: vendor.remark || ''
      }));
      console.log('Transformed vendor list:', transformedData); // Debug: Log transformed data
      setVendorList(transformedData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      alert('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const handleMenuClick = (event, vendor) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };

  const handleEditVendor = async (vendor) => {
    try {
      setEditLoading(true);
      const response = await fetch(`${BASE_URL}/vendors/${vendor.vendor_id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vendor details');
      }
      const vendorData = await response.json();
      console.log('Fetched vendor data for edit:', vendorData); // Debug: Log fetched data
      const vendorCopy = {
        vendor_id: vendorData.id,
        vendor_name: vendorData.vendor_name || '',
        company_name: vendorData.company_name || '',
        display_name: vendorData.display_name || '',
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        pan: vendorData.pan || '',
        gst: vendorData.gst || '',
        status: vendorData.status || 'Active',
        billing_address: {
          recipient_name: vendorData.billing_recipient_name || '',
          country: vendorData.billing_country || '',
          address_line1: vendorData.billing_address1 || '',
          address_line2: vendorData.billing_address2 || '',
          city: vendorData.billing_city || '',
          state: vendorData.billing_state || '',
          pincode: vendorData.billing_pincode || '',
          fax: vendorData.billing_fax || '',
          phone: vendorData.billing_phone || ''
        },
        shipping_address: {
          recipient_name: vendorData.shipping_recipient_name || '',
          country: vendorData.shipping_country || '',
          address_line1: vendorData.shipping_address1 || '',
          address_line2: vendorData.shipping_address2 || '',
          city: vendorData.shipping_city || '',
          state: vendorData.shipping_state || '',
          pincode: vendorData.shipping_pincode || '',
          fax: vendorData.shipping_fax || '',
          phone: vendorData.shipping_phone || ''
        },
        bank_details: {
          account_holder_name: vendorData.account_holder_name || '',
          bank_name: vendorData.bank_name || '',
          account_number: vendorData.account_number || '',
          ifsc: vendorData.ifsc || ''
        },
        remark: vendorData.remark || ''
      };
      console.log('Editing vendor:', vendorCopy); // Debug: Log vendor data being edited
      setEditingVendor(vendorCopy);
      setEditModalOpen(true);
      handleCloseMenu();
    } catch (error) {
      console.error('Error fetching vendor for edit:', error);
      alert(`Failed to load vendor details: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingVendor(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedVendor(null);
  };

  const handleDeleteClick = () => {
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${selectedVendor.vendor_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vendor');
      setVendorList(vendorList.filter(v => v.vendor_id !== selectedVendor.vendor_id));
      setOpenDialog(false);
      setSelectedVendor(null);
      alert('Vendor deleted successfully!');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  const handleSendEmail = (vendor) => {
    const subject = encodeURIComponent(`Regarding Vendor: ${vendor.vendor_name}`);
    const body = encodeURIComponent(`Hello,\n\nThis is regarding vendor ${vendor.vendor_name}.\n\nRegards.`);
    window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`;
    handleCloseMenu();
  };

  const handleShareLink = (vendor) => {
    navigator.clipboard.writeText(`https://dummy-vendor-link/${vendor.vendor_id}`);
    alert('Vendor link copied to clipboard!');
    handleCloseMenu();
  };

  const filteredVendors = vendorList.filter(v => {
    const matchesTab = tab === 0 || (tab === 1 && v.status === 'Active') || (tab === 2 && v.status === 'Inactive');
    const matchesSearch = (v.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Flatten vendor data for backend
  const flattenVendorData = (vendor) => {
    const flatData = {
      vendor_name: vendor.vendor_name || '',
      company_name: vendor.company_name || '',
      display_name: vendor.display_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      pan: vendor.pan || '',
      gst: vendor.gst || '',
      status: vendor.status || 'Active',
      billing_recipient_name: vendor.billing_address?.recipient_name || '',
      billing_country: vendor.billing_address?.country || '',
      billing_address1: vendor.billing_address?.address_line1 || '',
      billing_address2: vendor.billing_address?.address_line2 || '',
      billing_city: vendor.billing_address?.city || '',
      billing_state: vendor.billing_address?.state || '',
      billing_pincode: vendor.billing_address?.pincode || '',
      billing_fax: vendor.billing_address?.fax || '',
      billing_phone: vendor.billing_address?.phone || '',
      shipping_recipient_name: vendor.shipping_address?.recipient_name || '',
      shipping_country: vendor.shipping_address?.country || '',
      shipping_address1: vendor.shipping_address?.address_line1 || '',
      shipping_address2: vendor.shipping_address?.address_line2 || '',
      shipping_city: vendor.shipping_address?.city || '',
      shipping_state: vendor.shipping_address?.state || '',
      shipping_pincode: vendor.shipping_address?.pincode || '',
      shipping_fax: vendor.shipping_address?.fax || '',
      shipping_phone: vendor.shipping_address?.phone || '',
      account_holder_name: vendor.bank_details?.account_holder_name || '',
      bank_name: vendor.bank_details?.bank_name || '',
      account_number: vendor.bank_details?.account_number || '',
      ifsc: vendor.bank_details?.ifsc || '',
      remark: vendor.remark || ''
    };
    console.log('Flattened data for update:', flatData); // Debug: Log data sent to backend
    return flatData;
  };

  const vendorColumns = [
    { id: 'vendor_name', label: 'Name', accessor: 'vendor_name' },
    { id: 'company_name', label: 'Company Name', accessor: 'company_name' },
    { id: 'display_name', label: 'Display Name', accessor: 'display_name' },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    { id: 'email', label: 'Email Address', accessor: 'email' },
    { id: 'phone', label: 'Phone', accessor: 'phone' },
    {
      id: 'actions',
      label: 'Action',
      align: 'center',
      render: (row) => (
        <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Vendors">
        <LoadingState message="Loading vendors..." />
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout title="Vendors">
          {/* Edit Modal */}
          <Modal open={editModalOpen} onClose={handleEditClose}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              boxShadow: 24,
              borderRadius: 2,
              p: 4,
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <Typography variant="h6" mb={2}>Edit Vendor</Typography>
              {editLoading ? (
                <Typography>Loading vendor details...</Typography>
              ) : editingVendor ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  // Validate required fields
                  const requiredFields = [
                    'vendor_name', 'email', 'phone',
                    'billing_recipient_name', 'billing_country', 'billing_address1',
                    'billing_city', 'billing_state', 'billing_pincode',
                    'shipping_recipient_name', 'shipping_country', 'shipping_address1',
                    'shipping_city', 'shipping_state', 'shipping_pincode',
                    'account_holder_name', 'bank_name', 'account_number', 'ifsc'
                  ];
                  const flatVendor = flattenVendorData(editingVendor);
                  const newFieldErrors = {};

                  requiredFields.forEach(field => {
                    if (!flatVendor[field]) {
                      newFieldErrors[field] = 'Required field';
                    }
                  });

                  if (editingVendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingVendor.email)) {
                    newFieldErrors.email = 'Invalid email format';
                  }
                  
                  if (editingVendor.phone && !/^\d{10,}$/.test(editingVendor.phone.replace(/\D/g, ''))) {
                    newFieldErrors.phone = 'Invalid phone format';
                  }

                  if (Object.keys(newFieldErrors).length > 0) {
                    setFieldErrors(newFieldErrors);
                    alert('Please correct the highlighted errors');
                    return;
                  }
                  
                  setFieldErrors({});
                  
                  try {
                    setUpdateLoading(true);
                    const response = await fetch(`${BASE_URL}/vendors/${editingVendor.vendor_id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(flatVendor),
                    });
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Update failed');
                    }
                    alert('Vendor updated successfully!');
                    handleEditClose();
                    fetchVendors();
                  } catch (error) {
                    console.error('Error updating vendor:', error);
                    alert(`Update failed: ${error.message}`);
                  } finally {
                    setUpdateLoading(false);
                  }
                }}>
                  {/* Basic Info */}
                  <Typography variant="subtitle1" mt={2}>Basic Info</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {[
                      { field: 'vendor_name', label: 'Vendor Name' },
                      { field: 'company_name', label: 'Company Name' },
                      { field: 'display_name', label: 'Display Name' },
                      { field: 'email', label: 'Email' },
                      { field: 'phone', label: 'Phone' },
                      { field: 'pan', label: 'PAN' },
                      { field: 'gst', label: 'GST' },
                      { field: 'status', label: 'Status', options: ['Active', 'Inactive'] }
                    ].map(({ field, label, options }) => (
                      options ? (
                        <TextField
                          key={field}
                          select
                          label={label}
                          value={editingVendor[field] || ''}
                          onChange={(e) => setEditingVendor({ ...editingVendor, [field]: e.target.value })}
                          fullWidth
                          sx={{ flex: '1 1 45%' }}
                          required={['vendor_name', 'email', 'phone'].includes(field)}
                          error={field === 'email' && editingVendor[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingVendor[field])}
                          helperText={field === 'email' && editingVendor[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingVendor[field]) ? 'Invalid email format' : ''}
                        >
                          <MenuItem value="">Select {label}</MenuItem>
                          {options.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          key={field}
                          label={label}
                          value={editingVendor[field] || ''}
                          onChange={(e) => {
                            setEditingVendor({ ...editingVendor, [field]: e.target.value });
                            if (fieldErrors[field]) setFieldErrors({...fieldErrors, [field]: ''});
                          }}
                          fullWidth
                          sx={{ flex: '1 1 45%' }}
                          required={['vendor_name', 'email', 'phone'].includes(field)}
                          error={!!fieldErrors[field]}
                          helperText={fieldErrors[field] || ''}
                        />
                      )
                    ))}
                  </Box>

                  {/* Billing Address */}
                  <Typography variant="subtitle1" mt={3}>Billing Address</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {[
                      { field: 'recipient_name', label: 'Recipient Name' },
                      { field: 'country', label: 'Country' },
                      { field: 'address_line1', label: 'Address Line 1', multiline: true },
                      { field: 'address_line2', label: 'Address Line 2', multiline: true },
                      { field: 'city', label: 'City' },
                      { field: 'state', label: 'State' },
                      { field: 'pincode', label: 'Pincode' },
                      { field: 'fax', label: 'Fax' },
                      { field: 'phone', label: 'Phone' }
                    ].map(({ field, label, multiline }) => (
                      <TextField
                        key={field}
                        label={label}
                        value={editingVendor.billing_address?.[field] || ''}
                        onChange={(e) => {
                          setEditingVendor({
                            ...editingVendor,
                            billing_address: { ...editingVendor.billing_address, [field]: e.target.value }
                          });
                          const flatField = `billing_${field === 'recipient_name' ? 'recipient_name' : field}`;
                          if (fieldErrors[flatField]) setFieldErrors({...fieldErrors, [flatField]: ''});
                        }}
                        fullWidth
                        multiline={multiline}
                        sx={{ flex: '1 1 45%' }}
                        required={['recipient_name', 'country', 'address_line1', 'city', 'state', 'pincode'].includes(field)}
                        error={!!fieldErrors[`billing_${field === 'recipient_name' ? 'recipient_name' : field}`]}
                        helperText={fieldErrors[`billing_${field === 'recipient_name' ? 'recipient_name' : field}`] || ''}
                      />
                    ))}
                  </Box>

                  {/* Shipping Address */}
                  <Typography variant="subtitle1" mt={3}>Shipping Address</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {[
                      { field: 'recipient_name', label: 'Recipient Name' },
                      { field: 'country', label: 'Country' },
                      { field: 'address_line1', label: 'Address Line 1', multiline: true },
                      { field: 'address_line2', label: 'Address Line 2', multiline: true },
                      { field: 'city', label: 'City' },
                      { field: 'state', label: 'State' },
                      { field: 'pincode', label: 'Pincode' },
                      { field: 'fax', label: 'Fax' },
                      { field: 'phone', label: 'Phone' }
                    ].map(({ field, label, multiline }) => (
                      <TextField
                        key={field}
                        label={label}
                        value={editingVendor.shipping_address?.[field] || ''}
                        onChange={(e) => {
                          setEditingVendor({
                            ...editingVendor,
                            shipping_address: { ...editingVendor.shipping_address, [field]: e.target.value }
                          });
                          const flatField = `shipping_${field === 'recipient_name' ? 'recipient_name' : field}`;
                          if (fieldErrors[flatField]) setFieldErrors({...fieldErrors, [flatField]: ''});
                        }}
                        fullWidth
                        multiline={multiline}
                        sx={{ flex: '1 1 45%' }}
                        required={['recipient_name', 'country', 'address_line1', 'city', 'state', 'pincode'].includes(field)}
                        error={!!fieldErrors[`shipping_${field === 'recipient_name' ? 'recipient_name' : field}`]}
                        helperText={fieldErrors[`shipping_${field === 'recipient_name' ? 'recipient_name' : field}`] || ''}
                      />
                    ))}
                  </Box>

                  {/* Bank Details */}
                  <Typography variant="subtitle1" mt={3}>Bank Details</Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {[
                      { field: 'account_holder_name', label: 'Account Holder Name' },
                      { field: 'bank_name', label: 'Bank Name' },
                      { field: 'account_number', label: 'Account Number' },
                      { field: 'ifsc', label: 'IFSC Code' }
                    ].map(({ field, label }) => (
                      <TextField
                        key={field}
                        label={label}
                        value={editingVendor.bank_details?.[field] || ''}
                        onChange={(e) => {
                          setEditingVendor({
                            ...editingVendor,
                            bank_details: { ...editingVendor.bank_details, [field]: e.target.value }
                          });
                          if (fieldErrors[field]) setFieldErrors({...fieldErrors, [field]: ''});
                        }}
                        fullWidth
                        sx={{ flex: '1 1 45%' }}
                        required
                        error={!!fieldErrors[field]}
                        helperText={fieldErrors[field] || ''}
                      />
                    ))}
                  </Box>

                  {/* Remarks */}
                  <Box mt={3}>
                    <TextField
                      label="Remark"
                      fullWidth
                      multiline
                      rows={3}
                      value={editingVendor.remark || ''}
                      onChange={(e) => setEditingVendor({ ...editingVendor, remark: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={handleEditClose} variant="outlined" disabled={updateLoading || editLoading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={updateLoading || editLoading}>
                      {updateLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                </form>
              ) : (
                <Typography>No vendor data available</Typography>
              )}
            </Box>
          </Modal>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
          <PageHeader title="All Vendors" count={filteredVendors.length}>
            <Button
              variant="contained"
              sx={{ textTransform: 'none' }}
              onClick={() => navigate('/add-vendor')}
            >
              + New Vendor
            </Button>
          </PageHeader>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, val) => setTab(val)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="All Vendors" />
              <Tab label="Active Vendors" />
              <Tab label="Inactive Vendors" />
            </Tabs>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by vendor name..."
              debounceMs={200}
            />
          </Box>

          <DataTable
            columns={vendorColumns}
            rows={filteredVendors}
            rowKey="vendor_id"
            getRowId={(row) => row.vendor_id}
            emptyMessage="No vendors found"
          />

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Showing {filteredVendors.length} of {vendorList.length} entries
            </Typography>
            <Pagination count={3} page={1} />
          </Box>
        </Paper>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleEditVendor(selectedVendor)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleSendEmail(selectedVendor)}>
            <EmailIcon fontSize="small" sx={{ mr: 1 }} /> Send Email
          </MenuItem>
          <MenuItem onClick={() => handleShareLink(selectedVendor)}>
            <LinkIcon fontSize="small" sx={{ mr: 1 }} /> Share Link
          </MenuItem>
        </Menu>

        <ConfirmDialog
          open={openDialog}
          title="Delete Vendor"
          message={`Are you sure you want to delete "${selectedVendor?.display_name}"?`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setOpenDialog(false)}
        />
      </AppLayout>
    </>
  );
}
