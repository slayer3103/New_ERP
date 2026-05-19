import React from 'react';
import {
  Box, Typography, Button, InputBase, IconButton, Avatar, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Menu, MenuItem,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const rows = Array.from({ length: 15 }, (_, i) => ({
  invoiceNo: 'PINV-00001',
  customer: 'Customer 1',
  date: '30/06/2025',
  status: i % 2 === 0 ? 'Sent' : 'Draft',
  amount: '₹118.00',
}));

const statusColorMap = {
  Draft: { bg: '#E6E6E6', color: '#333' },
  Sent: { bg: '#E6F4EA', color: '#2E7D32' },
};

const ProformaInvoicelist = () => {
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  const handleMenuClick = (event, index) => {
    setMenuAnchor(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedIndex(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

        <Box
          sx={{
            height: 60,
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            px: 4,
            justifyContent: 'space-between',
            bgcolor: '#fff',
          }}
        >
          <Typography fontWeight="bold">Proforma Invoice</Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F0F0F0',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                minWidth: 250,
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: '#555' }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
              />
            </Box>

            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>

            <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">Proforma Invoice</Typography>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#004085',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#003060' },
                }}
              >
                + Add Proforma Invoice
              </Button>
            </Box>

          
            <Box display="flex" gap={1} mb={2}>
              {['All', 'Draft', 'Sent'].map((label) => (
                <Button key={label} variant="outlined" sx={{ textTransform: 'none' }}>
                  {label}
                </Button>
              ))}
            </Box>

       
            <Table size="small" sx={{ bgcolor: '#fff', borderRadius: 2 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f6fa' }}>
                  <TableCell padding="checkbox">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell>Proforma Invoice #</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bill Amount</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell padding="checkbox">
                      <input type="checkbox" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#007bff' }}>{row.invoiceNo}</TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: statusColorMap[row.status].bg,
                          color: statusColorMap[row.status].color,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuClick(e, i)}>
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
                count={100}
                page={0}
                rowsPerPage={15}
                rowsPerPageOptions={[]}
                onPageChange={() => {}}
              />
            </Box>
          </Paper>
        </Box>


        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleClose}>Edit</MenuItem>
          <MenuItem onClick={handleClose}>Delete</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ProformaInvoicelist;
