import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Menu,
  Table, TableHead, TableBody, TableRow, TableCell, TablePagination, MenuItem
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppLayout from '../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config/api';

const Taxlist = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [filter, setFilter] = useState('All');

  const open = Boolean(anchorEl);

  const handleClick = (event, rowIndex) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowIndex);
    setSelectedRowData(filteredTaxes[rowIndex]);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
    setSelectedRowData(null);
  };

  const fetchTaxes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/taxes`);
      setTaxes(res.data);
    } catch (err) {
      console.error("Error fetching taxes:", err);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleToggleStatus = async () => {
    if (!selectedRowData) return;

    const newStatus = selectedRowData.status === 'Active' ? 'Inactive' : 'Active';

    try {
      await axios.patch(`${BASE_URL}/taxes/${selectedRowData.id}/status`, {
        status: newStatus
      });
      fetchTaxes();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      handleClose();
    }
  };

  const filteredTaxes = taxes.filter(tax => {
    if (filter === 'All') return true;
    return tax.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <>
    <AppLayout title="Tax">
        <Box>
          <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">Tax</Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#004085',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#003060' },
                }}
                onClick={() => navigate('/add-tax')}
              >
                + Add Tax
              </Button>
            </Box>

            {/* Filter Buttons */}
            <Box display="flex" gap={1} mb={2}>
              {['All', 'Active', 'Inactive'].map(label => (
                <Button
                  key={label}
                  variant={filter === label ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setFilter(label)}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {/* Table */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"><input type="checkbox" /></TableCell>
                  <TableCell>Tax Type</TableCell>
                  <TableCell>Rate (%)</TableCell>
                  <TableCell>Label/Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Effective Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTaxes.map((row, i) => (
                  <TableRow key={row.id || i}>
                    <TableCell padding="checkbox"><input type="checkbox" /></TableCell>
                    <TableCell>{row.tax_name}</TableCell>
                    <TableCell>{row.tax_rate}%</TableCell>
                    <TableCell>{row.tax_code}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: row.status === 'Active' ? '#E6F4EA' : '#FEEAEA',
                          color: row.status === 'Active' ? '#2E7D32' : '#C62828',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.effective_date
                        ? new Date(row.effective_date).toLocaleDateString('en-IN')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleClick(e, i)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <TablePagination
                component="div"
                count={filteredTaxes.length}
                page={0}
                rowsPerPage={15}
                rowsPerPageOptions={[]}
                onPageChange={() => { }}
              />
            </Box>
          </Box>
        </Box>
    </AppLayout>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            navigate(`/edit-tax/${selectedRowData?.id}`);
            handleClose();
          }}
        >
          <EditIcon sx={{ fontSize: 16, mr: 1 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleToggleStatus}>
          {selectedRowData?.status === 'Active' ? 'Mark as Inactive' : 'Mark as Active'}
        </MenuItem>
        {/* <MenuItem onClick={handleClose} sx={{ color: 'red' }}>
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Delete
        </MenuItem> */}
      </Menu>
    </>
  );
};

export default Taxlist;
