import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { tokens } from '../theme/paletteTokens';

export default function UserMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState('');
  const isLoggedIn = Boolean(localStorage.getItem('username'));

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleClick = (event) => {
    if (isLoggedIn) {
      setAnchorEl(event.currentTarget);
    } else {
      navigate('/login');
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const role = localStorage.getItem('userRole');

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          cursor: 'pointer',
          px: 1,
          py: 0.5,
          borderRadius: 2,
          '&:hover': { bgcolor: tokens.mutedSurface },
        }}
        onClick={handleClick}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: tokens.primary,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {username ? username.charAt(0).toUpperCase() : '?'}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography fontSize={14} fontWeight={600} color={tokens.textPrimary} lineHeight={1.2}>
            {isLoggedIn ? username : 'Login'}
          </Typography>
          {role && (
            <Typography fontSize={11} color={tokens.textSecondary} lineHeight={1.2}>
              {role}
            </Typography>
          )}
        </Box>
        <ArrowDropDownIcon sx={{ color: tokens.textSecondary, fontSize: 20 }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1,
            borderRadius: 2,
            border: `1px solid ${tokens.border}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600}>
            {username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {role}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: tokens.textSecondary }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
