import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton, Paper, InputBase,Avatar
} from '@mui/material';
import {
  Dashboard,
  Inventory2,
  People,
  Description,
  Receipt,
  Store,
  Search,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import UserMenu from './UserMenu';

const InvoicePage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fb' }}>


      <Sidebar />

      <Box sx={{ flexGrow: 1 }}>

                <Box sx={{
                    px: 4, py: 2,
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: 'white',
                     display: 'flex',  
                    justifyContent:'space-between'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Invoice</Typography>
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
                        </IconButton> <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
                    </Box>
                </Box>

        <Box
          sx={{
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8f9fb',
            textAlign: 'center',
          }}
        >
          <img
            src="https://d3a93fg1wt2nf3.cloudfront.net/static/website/images/is_images/invoicing-software.svg"
            alt="invoice"
            style={{ width: 180, marginBottom: 20 }}
          />
          <Typography fontWeight="bold">Create New Invoice</Typography>
          <Typography variant="body2" sx={{ color: '#777', maxWidth: 360, mt: 1 }}>
            Quickly add customer and product details to generate your invoice.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Receipt />}>
              Pro Forma Invoice
            </Button>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              sx={{ backgroundColor: '#002D72' }}
              onClick={() => navigate('/new-invoice')}
            >
              New Invoice
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePage;
