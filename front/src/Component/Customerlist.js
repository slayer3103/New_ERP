import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, TextField, InputAdornment, IconButton,
    Paper, Table, TableBody, TableCell, TableHead, TableRow, Menu, MenuItem,
    Checkbox, Modal, InputBase, Avatar
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Print as PrintIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    NotificationsNone as NotificationsNoneIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const navigate = useNavigate();


    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [printCustomer, setPrintCustomer] = useState(null);


    const handlePrintStatement = (customer) => {
        setPrintCustomer(customer);
        setPrintDialogOpen(true);
        handleMenuClose();
    };


    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/customers`);
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, rowId) => {
        setMenuAnchor(event.currentTarget);
        setSelectedRow(rowId);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedRow(null);
    };

    const validateEdit = () => {
        const e = {};
        // Basic Information
        if (!editingCustomer.customer_name || !editingCustomer.customer_name.trim()) e.customer_name = 'Customer name is required';
        else if (editingCustomer.customer_name.trim().length < 2) e.customer_name = 'Must be at least 2 characters';
        
        if (!editingCustomer.display_name || !editingCustomer.display_name.trim()) e.display_name = 'Display name is required';
        else if (editingCustomer.display_name.trim().length < 2) e.display_name = 'Must be at least 2 characters';
        
        if (editingCustomer.company_name && editingCustomer.company_name.trim().length < 2) e.company_name = 'Must be at least 2 characters';

        // Contact Information
        if (editingCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingCustomer.email)) e.email = 'Invalid email format';
        if (editingCustomer.mobile && !/^\d{10}$/.test(editingCustomer.mobile)) e.mobile = 'Mobile must be exactly 10 digits';
        if (editingCustomer.office_no && !/^\d{8,15}$/.test(editingCustomer.office_no)) e.office_no = 'Office number must be 8-15 digits';

        // Tax Information
        if (editingCustomer.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(editingCustomer.pan.toUpperCase())) e.pan = 'Invalid PAN (e.g. ABCDE1234F)';
        if (editingCustomer.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(editingCustomer.gst.toUpperCase())) e.gst = 'Invalid GST format';

        // Billing Address Validation
        if (editingCustomer.billing_recipient_name && editingCustomer.billing_recipient_name.trim().length < 2) e.billing_recipient_name = 'Must be at least 2 characters';
        if (editingCustomer.billing_address1 && editingCustomer.billing_address1.trim().length < 5) e.billing_address1 = 'Address must be at least 5 characters';
        if (editingCustomer.billing_country && !/^[a-zA-Z\s]+$/.test(editingCustomer.billing_country)) e.billing_country = 'Country must contain only letters';
        if (editingCustomer.billing_state && !/^[a-zA-Z\s]+$/.test(editingCustomer.billing_state)) e.billing_state = 'State must contain only letters';
        if (editingCustomer.billing_city && !/^[a-zA-Z\s]+$/.test(editingCustomer.billing_city)) e.billing_city = 'City must contain only letters';
        if (editingCustomer.billing_state_code && !/^\d{1,2}$/.test(editingCustomer.billing_state_code)) e.billing_state_code = 'State code must be 1-2 digits';
        if (editingCustomer.billing_pincode && !/^\d{6}$/.test(editingCustomer.billing_pincode)) e.billing_pincode = 'Pincode must be exactly 6 digits';
        if (editingCustomer.billing_phone && !/^\d{8,15}$/.test(editingCustomer.billing_phone)) e.billing_phone = 'Phone must be 8-15 digits';
        if (editingCustomer.billing_fax && !/^\d{8,15}$/.test(editingCustomer.billing_fax)) e.billing_fax = 'Fax must be 8-15 digits';

        // Shipping Address Validation
        if (editingCustomer.shipping_recipient_name && editingCustomer.shipping_recipient_name.trim().length < 2) e.shipping_recipient_name = 'Must be at least 2 characters';
        if (editingCustomer.shipping_address1 && editingCustomer.shipping_address1.trim().length < 5) e.shipping_address1 = 'Address must be at least 5 characters';
        if (editingCustomer.shipping_country && !/^[a-zA-Z\s]+$/.test(editingCustomer.shipping_country)) e.shipping_country = 'Country must contain only letters';
        if (editingCustomer.shipping_state && !/^[a-zA-Z\s]+$/.test(editingCustomer.shipping_state)) e.shipping_state = 'State must contain only letters';
        if (editingCustomer.shipping_city && !/^[a-zA-Z\s]+$/.test(editingCustomer.shipping_city)) e.shipping_city = 'City must contain only letters';
        if (editingCustomer.shipping_state_code && !/^\d{1,2}$/.test(editingCustomer.shipping_state_code)) e.shipping_state_code = 'State code must be 1-2 digits';
        if (editingCustomer.shipping_pincode && !/^\d{6}$/.test(editingCustomer.shipping_pincode)) e.shipping_pincode = 'Pincode must be exactly 6 digits';
        if (editingCustomer.shipping_phone && !/^\d{8,15}$/.test(editingCustomer.shipping_phone)) e.shipping_phone = 'Phone must be 8-15 digits';
        if (editingCustomer.shipping_fax && !/^\d{8,15}$/.test(editingCustomer.shipping_fax)) e.shipping_fax = 'Fax must be 8-15 digits';

        // Other Information
        if (editingCustomer.remark && editingCustomer.remark.length > 500) e.remark = 'Remark cannot exceed 500 characters';
        
        return e;
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCustomers(customers.map((c) => c.id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedCustomers((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleEditClick = (customer) => {
        setEditingCustomer(customer);
        setEditErrors({});
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
        setEditingCustomer(null);
        setEditErrors({});
    };

    const toggleCustomerStatus = async (customer) => {
        const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
        try {
            const response = await fetch(`${BASE_URL}/customers/${customer.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            await fetchCustomers(); // refresh list
        } catch (err) {
            console.error('Failed to toggle status', err);
            alert('Status update failed.');
        } finally {
            handleMenuClose();
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Format mobile number: 9876543210 → 98765 43210
    const formatMobile = (mobile) => {
        if (!mobile) return '—';
        const m = mobile.toString().replace(/\D/g, '');
        return m.length === 10 ? `${m.slice(0,5)} ${m.slice(5)}` : m;
    };

    // Format name: capitalize each word
    const formatName = (name) => {
        if (!name) return '—';
        return name.trim().replace(/\b\w/g, c => c.toUpperCase());
    };

    // Filter customers by search and type
    const filteredCustomers = customers.filter((c) => {
        const matchSearch = !searchTerm ||
            (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.mobile || '').includes(searchTerm);
        const matchType = filterType === 'All' || c.customer_type === filterType;
        return matchSearch && matchType;
    });

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Loading customers...</Typography>
            </Box>
        );
    }


    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />

            {/* Print Statement Dialog */}
            <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Print Statement</DialogTitle>
                <DialogContent>
                    <Typography variant="h6" mb={2}>{printCustomer?.customer_name} - Statement</Typography>
                    {/* Dummy statement data */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { date: '2025-07-01', desc: 'Invoice #1001', amount: '₹1,000' },
                                { date: '2025-07-05', desc: 'Payment Received', amount: '-₹1,000' },
                                { date: '2025-07-10', desc: 'Invoice #1002', amount: '₹2,000' },
                            ].map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.desc}</TableCell>
                                    <TableCell>{row.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.print()} variant="contained" color="primary">Print</Button>
                    <Button onClick={() => setPrintDialogOpen(false)} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>


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
                    <Typography variant="h6" mb={2}>Edit Customer</Typography>
                    {editingCustomer && (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const validationErrs = validateEdit();
                            if (Object.keys(validationErrs).length > 0) {
                                setEditErrors(validationErrs);
                                return;
                            }
                            try {
                                await fetch(`${BASE_URL}/customers/${editingCustomer.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(editingCustomer),
                                });
                                alert('Customer updated!');
                                handleEditClose();
                                fetchCustomers();
                            } catch (error) {
                                console.error('Error updating customer:', error);
                                alert('Update failed.');
                            }
                        }}>
                            {/* Basic Info */}
                            <Typography variant="subtitle1" mt={2}>Basic Info</Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                {[
                                    { field: 'customer_type', label: 'Customer Type', options: ['Domestic', 'International'] },
                                    { field: 'title', label: 'Title', options: ['Mr.', 'Mrs.', 'Ms.', 'Dr.'] },
                                    { field: 'customer_name', label: 'Customer Name' },
                                    { field: 'company_name', label: 'Company Name' },
                                    { field: 'display_name', label: 'Display Name' },
                                    { field: 'email', label: 'Email' },
                                    { field: 'mobile', label: 'Mobile' },
                                    { field: 'office_no', label: 'Office No' },
                                    { field: 'pan', label: 'PAN' },
                                    { field: 'gst', label: 'GST' },
                                    { field: 'currency', label: 'Currency', options: ['INR', 'USD', 'EUR'] },
                                    { field: 'document_path', label: 'Document Path' },
                                    { field: 'status', label: 'Status', options: ['Active', 'Inactive'] }
                                ].map(({ field, label, options }) => (
                                    options ? (
                                        <TextField
                                            key={field}
                                            select
                                            label={label}
                                            value={editingCustomer[field] || ''}
                                            onChange={(e) => {
                                                setEditingCustomer({ ...editingCustomer, [field]: e.target.value });
                                                if (editErrors[field]) setEditErrors({ ...editErrors, [field]: '' });
                                            }}
                                            fullWidth
                                            sx={{ flex: '1 1 45%' }}
                                            error={!!editErrors[field]}
                                            helperText={editErrors[field] || ''}
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
                                            value={editingCustomer[field] || ''}
                                            onChange={(e) => {
                                                const val = (field === 'pan' || field === 'gst') ? e.target.value.toUpperCase() : e.target.value;
                                                setEditingCustomer({ ...editingCustomer, [field]: val });
                                                if (editErrors[field]) setEditErrors({ ...editErrors, [field]: '' });
                                            }}
                                            fullWidth
                                            sx={{ flex: '1 1 45%' }}
                                            error={!!editErrors[field]}
                                            helperText={editErrors[field] || ''}
                                        />
                                    )
                                ))}
                            </Box>

                            {/* Billing Info */}
                            <Typography variant="subtitle1" mt={3}>Billing Info</Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                {[
                                    'billing_recipient_name', 'billing_country', 'billing_address1', 'billing_address2',
                                    'billing_city', 'billing_state', 'billing_pincode', 'billing_fax', 'billing_phone'
                                ].map(field => (
                                    <TextField
                                        key={field}
                                        label={field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        value={editingCustomer[field] || ''}
                                        onChange={(e) => {
                                            setEditingCustomer({ ...editingCustomer, [field]: e.target.value });
                                            if (editErrors[field]) setEditErrors({ ...editErrors, [field]: '' });
                                        }}
                                        fullWidth
                                        multiline={field.includes('address')}
                                        sx={{ flex: '1 1 45%' }}
                                        error={!!editErrors[field]}
                                        helperText={editErrors[field] || ''}
                                    />
                                ))}
                            </Box>

                            {/* Shipping Info */}
                            <Typography variant="subtitle1" mt={3}>Shipping Info</Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                {[
                                    'shipping_recipient_name', 'shipping_country', 'shipping_address1', 'shipping_address2',
                                    'shipping_city', 'shipping_state', 'shipping_pincode', 'shipping_fax', 'shipping_phone'
                                ].map(field => (
                                    <TextField
                                        key={field}
                                        label={field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        value={editingCustomer[field] || ''}
                                        onChange={(e) => {
                                            setEditingCustomer({ ...editingCustomer, [field]: e.target.value });
                                            if (editErrors[field]) setEditErrors({ ...editErrors, [field]: '' });
                                        }}
                                        fullWidth
                                        multiline={field.includes('address')}
                                        sx={{ flex: '1 1 45%' }}
                                        error={!!editErrors[field]}
                                        helperText={editErrors[field] || ''}
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
                                    value={editingCustomer.remark || ''}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, remark: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                            </Box>

                            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                                <Button onClick={handleEditClose} variant="outlined">Cancel</Button>
                                <Button type="submit" variant="contained">Save</Button>
                            </Box>
                        </form>
                    )}
                </Box>
            </Modal>

            {/* Main Content */}
            <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: '#f9fafc' }}>
                {/* Top bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 1, px: 3 }}>
                    <Typography color="text.secondary" fontSize="20px">Customer</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '999px',
                                border: '1px solid #e0e0e0',
                                width: 240,
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 20, color: '#999' }} />
                            <InputBase placeholder="Search anything here..." sx={{ ml: 1, fontSize: 14, flex: 1 }} />
                        </Paper>
                        <IconButton sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', bgcolor: '#f9fafb', p: 1 }}>
                            <NotificationsNoneIcon sx={{ fontSize: 20, color: '#666' }} />
                        </IconButton>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Avatar src="https://i.pravatar.cc/40?img=1" />
                            <UserMenu />
                        </Box>
                    </Box>
                </Box>

                {/* Table */}
                <Box sx={{ px: 2, py: 2 }}>
                    <Paper sx={{ p: 1, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer</Typography>
                                <Box sx={{ bgcolor: '#e8f0fe', color: '#1a56db', px: 1.5, py: 0.3, borderRadius: '999px', fontSize: 13, fontWeight: 600 }}>
                                    {filteredCustomers.length}
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                                {/* Filter by type */}
                                <TextField
                                    select
                                    size="small"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    sx={{ minWidth: 140 }}
                                >
                                    <MenuItem value="All">All Types</MenuItem>
                                    <MenuItem value="Domestic">Domestic</MenuItem>
                                    <MenuItem value="International">International</MenuItem>
                                </TextField>
                                {/* Search */}
                                <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, borderRadius: '999px', border: '1px solid #e0e0e0', width: 220 }}>
                                    <SearchIcon sx={{ fontSize: 18, color: '#999' }} />
                                    <InputBase
                                        placeholder="Search customers..."
                                        sx={{ ml: 1, fontSize: 13, flex: 1 }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    )}
                                </Paper>
                                <Button
                                    variant="contained"
                                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#004085', '&:hover': { bgcolor: '#003366' } }}
                                    onClick={() => navigate('/add-customer')}
                                >
                                    + New Customer
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ px: 4, pt: 2 }}>
                            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: '#fff' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f6fa' }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                                    indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < filteredCustomers.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Company Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>GST No.</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredCustomers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#999' }}>
                                                    No customers found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                        filteredCustomers.map((row) => (
                                            <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedCustomers.includes(row.id)}
                                                        onChange={() => handleSelectOne(row.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{
                                                        display: 'inline-block', px: 1.5, py: 0.4,
                                                        borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                                        bgcolor: row.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                                        color: row.status === 'Active' ? '#065f46' : '#991b1b',
                                                    }}>
                                                        {row.status || 'Inactive'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{formatName(row.company_name) || '—'}</TableCell>
                                                <TableCell>{formatName(row.customer_name)}</TableCell>
                                                <TableCell>
                                                    <Box sx={{
                                                        display: 'inline-block', px: 1.2, py: 0.3,
                                                        borderRadius: '6px', fontSize: '12px',
                                                        bgcolor: row.customer_type === 'Domestic' ? '#eff6ff' : '#fdf4ff',
                                                        color: row.customer_type === 'Domestic' ? '#1d4ed8' : '#7e22ce',
                                                        fontWeight: 500
                                                    }}>
                                                        {row.customer_type || '—'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: '#374151', fontSize: 13 }}>{row.email || '—'}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{formatMobile(row.mobile)}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{row.gst || '—'}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)}><MoreVertIcon /></IconButton>
                                                    {selectedRow === row.id && (
                                                        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose} PaperProps={{ sx: { width: 200 } }}>
                                                            <MenuItem onClick={() => { handleEditClick(row); handleMenuClose(); }}>
                                                                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                                                            </MenuItem>
                                                            <MenuItem onClick={() => handlePrintStatement(row)}>
                                                                <PrintIcon fontSize="small" sx={{ mr: 1 }} /> Print Statement
                                                            </MenuItem>
                                                            <MenuItem onClick={() => toggleCustomerStatus(row)}>
                                                                <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                                                                {row.status === 'Active' ? 'Mark as Inactive' : 'Mark as Active'}
                                                            </MenuItem>
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}


