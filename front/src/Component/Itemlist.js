import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Menu, MenuItem, Chip, Checkbox, InputAdornment, Paper, Pagination, InputBase, Avatar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from './Sidebar';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditProductDialog from './EditProductDialog'; // Add this at the top
import BASE_URL from '../config/api';



export default function ItemList() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Step 1: Fetch the full product data
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      const fullProduct = res.data;

      // Step 2: Update only the status
      fullProduct.status = newStatus;

      // Step 3: Send the complete data back via PUT
      await axios.put(`${BASE_URL}/products/${id}`, fullProduct);

      // Step 4: Update frontend state or reload
      fetchItems();
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  // Open dialog
  const openEditDialog = (item) => {
    setProductToEdit(item);
    setEditDialogOpen(true);
  };

  // Save changes
  const handleEditSave = async (updatedData) => {
    try {
      await axios.put(`${BASE_URL}/products/${updatedData.id}`, updatedData);
      setEditDialogOpen(false);
      setProductToEdit(null);
      // Refresh data
      const res = await axios.get(`${BASE_URL}/products`);
      setItems(res.data);
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };




  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const handleMenuOpen = (e, itemId) => {
    setAnchorEl(e.currentTarget);
    setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const getFilteredItems = () => {
    if (tab === 0) return items;
    if (tab === 1) return items.filter(i => i.status === 'Active');
    if (tab === 2) return items.filter(i => i.status === 'Inactive');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar active="Items" />
      <Box sx={{ flex: 1, bgcolor: '#f9fafc', minHeight: '100vh' }}>
        {/* ... HEADER UI same as before ... */}

        <Box sx={{ px: 2, py: 2 }}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 4, py: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" fontWeight={600}>Products & Services</Typography>
              <Button
                variant="contained"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#004085',
                  '&:hover': { bgcolor: '#003366' }
                }}
                onClick={() => navigate('/add-items')}
              >
                + New Products & Services
              </Button>
            </Box>

            <Box sx={{ px: 4, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tabs
                value={tab}
                onChange={(e, newTab) => setTab(newTab)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    bgcolor: '#f1f1f1',
                    borderRadius: 2,
                    mr: 1,
                    textDecoration: 'none',
                  },
                  '& .Mui-selected': {
                    bgcolor: '#004085',
                    color: 'white !important',
                    textDecoration: 'none',
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                <Tab label="All" />
                <Tab label="Active" />
                <Tab label="Inactive" />
              </Tabs>

              <TextField
                size="small"
                placeholder="Search by item name..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'white', borderRadius: 2 }
                }}
              />
            </Box>

            <Box sx={{ px: 4, pt: 2 }}>
              <Paper elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f6fa' }}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Selling Price</TableCell>
                      <TableCell>Purchase Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredItems()?.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>₹{item.sale_price}</TableCell>
                        <TableCell>₹{item.purchase_price}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            color={item.status === 'Active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          {selectedItem === item.id && (
                            <Menu
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl)}
                              onClose={handleMenuClose}
                              PaperProps={{ sx: { width: 180 } }}
                            >


                              <MenuItem onClick={() => openEditDialog(item)}>
                                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                              </MenuItem>



                              <MenuItem onClick={() => handleStatusChange(selectedItem, item.status === 'Active' ? 'Inactive' : 'Active')}>
                                {item.status === 'Active' ? (
                                  <>
                                    <BlockIcon fontSize="small" sx={{ mr: 1 }} /> Mark as Inactive
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Mark as Active
                                  </>
                                )}
                              </MenuItem>



                            </Menu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Box>

      <EditProductDialog
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
  product={productToEdit}
  onSave={handleEditSave}
/>


    </Box>
    
  );
}
