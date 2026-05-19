import {
    Box, Typography, Button,Avatar
} from '@mui/material';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import {
     Grid, 
    IconButton,  Paper,  InputBase
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function ProFormaInvoice() {
    const navigate=useNavigate()
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar active="Pro Forma Invoice" />

            <Box sx={{ flex: 1, bgcolor: '#f9fafc', minHeight: '100vh' }}>

                <Box sx={{
                    px: 4, py: 2,
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: 'white',
                     display: 'flex',  
                    justifyContent:'space-between'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Pro Forma Invoice</Typography>
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


                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 100px)',
                    textAlign: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Box
                        component="img"
                        src="https://shubham.in.net/img/wp.png"
                        alt="Empty State"
                        sx={{ width: 200, mb: 1 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Add New Pro Forma Invoice
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add and manage your Pro Forma Invoice, all in one place.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            mt: 1,
                            bgcolor: '#004085',
                            textTransform: 'none',
                            px: 4,
                            py: 1,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#003366' }
                        }}
                        onClick={() => navigate('/add-Pro-Forma-Invoice')}
                    >
                        + New Pro Forma Invoice
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
