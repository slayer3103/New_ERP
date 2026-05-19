import {
  Box,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  IconButton,
  Paper,
  Checkbox,
  Modal,
  Tabs,
  Tab,
  InputBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Avatar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  InputAdornment,
} from '@mui/material';
import {
  Search,
} from '@mui/icons-material';
import { Breadcrumbs } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UserMenu from './UserMenu';
const NewProFormaInvoice = () => {
const navigate =useNavigate()
  const [customers, setCustomers] = useState(['Customer 1', 'Customer 2']);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerTab, setCustomerTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleAddCustomer = () => {
    setCustomerModalOpen(true);
  }
  const [items, setItems] = useState(['Item 1', 'Item 2']);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [rows, setRows] = useState([
    { item: '', qty: 0, rate: 0, discount: 0, amount: 0 },
  ]);



  const handleItemSelect = (rowIndex, itemName) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].item = itemName;
    setRows(updatedRows);
    setItemModalOpen(false);
  };


  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = parseFloat(value) || 0;
    updated[index].amount = calculateAmount(updated[index]);
    setRows(updated);
  };


  const calculateAmount = (row) => {
    const total = (row.qty || 0) * (row.rate || 0);
    return total - (row.discount || 0);
  };

  const addNewRow = () => {
    setRows([...rows, { item: '', qty: 0, rate: 0, discount: 0, amount: 0 }]);
  };

  const deleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const subtotal = rows.reduce((sum, row) => sum + calculateAmount(row), 0);
  const gst = subtotal * 0.09;
  const total = subtotal + gst * 2;

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            mt: 1,
          }}
        >

          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Typography color="text.secondary" fontSize="14px">
               Pro Forma Invoice
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              New Pro Forma Invoice
            </Typography>
          </Breadcrumbs>

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
                bgcolor: '#f9fafb',
                width: 240,
              }}
            >
              <SearchIcon sx={{ fontSize: 20, color: '#999' }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, fontSize: 14, flex: 1 }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Paper>

            <IconButton
              sx={{
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                bgcolor: '#f9fafb',
                p: 1,
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20, color: '#666' }} />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src="https://i.pravatar.cc/150?img=1" />
                        <Typography fontSize={14}>Admin name</Typography>
                        <ArrowDropDownIcon />
                      </Box>
          </Box>
        </Box>
        <Paper sx={{ p: 1, borderRadius: 2 }}>


          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#111',
              mb: 2,
              borderBottom: '1px solid #eee',
              pb: 1,
            }}
          >
            New Pro Forma Invoice
          </Typography>

          <Grid container spacing={1}>

            <Grid item xs={12} sm={6} md={1}>
              <TextField
                required
                label="Pro Forma Invoice Number"
                defaultValue="ME-000001"
                sx={{
                  width: 500,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '22px',
                    bgcolor: '#f9fafb',
                  },
                }}
              />

            </Grid>


            <Grid container spacing={2} sx={{ mt: 1 }}>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>Customer Name</InputLabel>
                  <Select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    displayEmpty
                    sx={{
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 300,
                    }}
                  >
                    {customers.length === 0 ? (
                      <MenuItem disabled>No result found</MenuItem>
                    ) : (
                      customers.map((customer, index) => (
                        <MenuItem key={index} value={customer}>
                          {customer}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Box mt={1}>
                  <Button
                    size="small"
                    sx={{ textTransform: 'none', color: '#3f51b5' }}
                    onClick={handleAddCustomer}
                  >
                    + Add New Customer
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Pro Forma Invoice Date"
                  type="date"
                  defaultValue="2025-06-21"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 300,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    label="Payment Terms"
                    defaultValue="Due end of the month"
                    sx={{
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 200,
                    }}
                  >
                    <MenuItem value="Due end of the month">Due end of the month</MenuItem>
                    <MenuItem value="Net 15">Net 15</MenuItem>
                    <MenuItem value="Net 30">Net 30</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Due Date"
                  type="date"
                  defaultValue="2025-06-30"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 200,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  placeholder="Write what this Pro Forma Invoice is about"
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>



          <Box mt={5}>
            <Divider />
            <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ fontWeight: 600, fontSize: 18, }}>
              Item Table
            </Typography>
            <Box display="flex" justifyContent="flex-end" mt={1} gap={3}>
              <Button variant="text" sx={{ fontWeight: 500, color: '#1976d2' }} onClick={addNewRow}>
                + ADD NEW ROW
              </Button>
              <Button variant="text" sx={{ fontWeight: 500, color: '#1976d2' }}>
                + ADD ITEMS IN BULK
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Item Details</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rate</TableCell>
                                                                   <TableCell>Discount</TableCell>
                                                               
                                                                <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          placeholder="Type or Click to select an item"
                          value={row.item}
                          InputProps={{ readOnly: true }}
                          onClick={() => {
                            setSelectedRowIndex(index);
                            setItemModalOpen(true);
                            setItemSearchTerm('');
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={row.qty}
                          onChange={(e) => updateRow(index, 'qty', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateRow(index, 'rate', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth >
                          <Select
                            value={row.discount}
                            onChange={(e) => updateRow(index, 'discount', e.target.value)}
                          >
                            <MenuItem value={0}>0%</MenuItem>
                            <MenuItem value={5}>5%</MenuItem>
                            <MenuItem value={10}>10%</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={calculateAmount(row).toFixed(2)}
                          InputProps={{ readOnly: true }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => deleteRow(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container spacing={2} mt={4}>
              <Grid item xs={12} sm={8}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <TextField

                    multiline
                    rows={1}
                    label="Customer Notes"
                    defaultValue="Thanks for your business."
                    helperText="Will be displayed on the Pro Forma Invoice"
                    sx={{ bgcolor: '#f9fafb', borderRadius: 1, width: 500, }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4} sx={{ ml: 15 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    width: '200%',
                  }}
                >
                  {[
                    { label: 'Sub Total', value: `₹${subtotal.toFixed(2)}` },
                    { label: 'CGST (9%)', value: `₹${gst.toFixed(2)}` },
                    { label: 'SGST (9%)', value: `₹${gst.toFixed(2)}` },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography fontSize={14}>{item.label}</Typography>
                      <Typography fontSize={14}>{item.value}</Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="bold" fontSize="1rem">
                      Total (₹)
                    </Typography>
                    <Typography fontWeight="bold" fontSize="1rem">
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

            </Grid>
          </Box>

          <Grid container spacing={2} mt={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Terms & Conditions" />
              <Box display="flex" alignItems="center" mt={1}>
                <Checkbox />
                <Typography variant="body2">Use this in future for all Pro Forma Invoices</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ ml: 60 }}>
              <Typography>Attachment</Typography>
              <Button variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
                Upload File
              </Button>
              <Typography variant="caption" display="block" mt={1}>
                You can upload a maximum of 10 files, 10MB each
              </Typography>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                startIcon={<VisibilityOutlinedIcon />}
                sx={{ color: '#002D72', textTransform: 'none', fontWeight: 'bold' }}
                onClick={() => setPreviewOpen(true)}
              >
                Preview Pro Forma Invoice
              </Button>

            </Box>
              <Box display="flex" gap={2}>
              <Button variant="outlined" color="inherit"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
               
                }}>Cancel</Button>
              <Button variant="outlined"onClick={() => navigate('/pro-forma-invoice-list')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                color: '#003366',border: '1px solid #004085',
              
                }}>Save as Draft</Button>
              <Button variant="contained" onClick={() => navigate('/pro-forma-invoice-list')} 
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#004085',
                  '&:hover': { bgcolor: '#003366' }
                }}>Save & Send</Button>
            </Box>
          </Box>


          <Modal open={customerModalOpen} onClose={() => setCustomerModalOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 350,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 3
              }}
            >
              <TextField
                fullWidth
                placeholder="Search customer here..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Tabs value={customerTab} onChange={(e, val) => setCustomerTab(val)} centered sx={{ mt: 2 }}>
                <Tab label="Business" />
                <Tab label="Individual" />
              </Tabs>
              <Box textAlign="center" mt={3}>
                <Typography color="text.secondary">No result found</Typography>
              </Box>
              <Box mt={2} textAlign="center">
                <Button variant="text" size="small">+ Add New Customer</Button>
              </Box>
            </Box>
          </Modal>
<Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      flexDirection: 'column',
    }}
  >
    <Box
      sx={{
        width: 480,
        bgcolor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 24,
        px: 3,
        py: 4,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <img src="https://cdn-icons-png.flaticon.com/512/8372/8372013.png" alt="logo" width={40} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography fontWeight="bold" fontSize={20}>Pro Forma Invoice</Typography>
        <Typography fontSize={12} color="text.secondary">#ME22334-01</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography fontSize={12}>Issued</Typography>
          <Typography fontSize={13} fontWeight={500}>01 Aug, 2023</Typography>
        </Box>
        <Box>
          <Typography fontSize={12}>Due</Typography>
          <Typography fontSize={13} fontWeight={500}>10 Aug, 2023</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography fontSize={12} fontWeight={500}>Bill To</Typography>
          <Typography fontSize={13}>Company Name</Typography>
          <Typography fontSize={13}>Delhi, India - 000000</Typography>
          <Typography fontSize={13}>+91 92483-64327</Typography>
        </Box>
        <Box>
          <Typography fontSize={12} fontWeight={500}>From</Typography>
          <Typography fontSize={13}>Ramesh, Inc</Typography>
          <Typography fontSize={13}>Dudu, India - 303008</Typography>
          <Typography fontSize={13}>IN +91 83028-29003</Typography>
        </Box>
      </Box>

      <Box sx={{
        display: 'flex', fontWeight: 600, fontSize: 13,
        borderBottom: '1px solid #ddd', pb: 1
      }}>
        <Box width="40%">Service</Box>
        <Box width="15%">Qty</Box>
        <Box width="20%">Rate</Box>
        <Box width="25%" textAlign="right">Line Total</Box>
      </Box>

      {rows.map((row, i) => (
        <Box key={i} sx={{
          display: 'flex', fontSize: 13, py: 1,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Box width="40%">{row.item || '-'}</Box>
          <Box width="15%">{row.qty}</Box>
          <Box width="20%">₹{row.rate}</Box>
          <Box width="25%" textAlign="right">₹{calculateAmount(row).toFixed(2)}</Box>
        </Box>
      ))}

      <Box mt={2} mb={2} sx={{ textAlign: 'right', fontSize: 13 }}>
        <Typography>Subtotal: ₹{total.toFixed(2)}</Typography>
        <Typography>Tax (9%): ₹{(total * 0.09).toFixed(2)}</Typography>
        <Typography fontWeight="bold" mt={1}>Total: ₹{(total * 1.09).toFixed(2)}</Typography>
        <Typography color="primary" mt={1} fontWeight="bold">Amount due: ₹{(total * 1.09).toFixed(2)}</Typography>
      </Box>

  
      <Box mt={3} sx={{ borderTop: '1px solid #eee', pt: 2, fontSize: 12 }}>
        <Typography>Thanks for your business!</Typography>
        <Typography variant="caption" display="block" color="text.secondary">This is a system generated Pro Forma Invoice.</Typography>
      </Box>
    </Box>

    <Box sx={{ mt: 2 }}>
      <IconButton
        onClick={() => setPreviewOpen(false)}
        sx={{
          bgcolor: '#fff',
          borderRadius: '50%',
          boxShadow: 3,
          '&:hover': {
            bgcolor: '#f5f5f5',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  </Box>
</Modal>

        </Paper>
      </Box>
    </Box>
  );
};

export default NewProFormaInvoice;
