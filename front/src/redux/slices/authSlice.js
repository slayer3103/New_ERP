import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../config/api';

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async ({ role }, { rejectWithValue }) => {
    try {
      // Here you would typically integrate with Google OAuth
      // For now, we'll simulate a successful login
      return { user: { id: 1, username: 'user@example.com' }, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupWithGoogle = createAsyncThunk(
  'auth/signupWithGoogle',
  async ({ role }, { rejectWithValue }) => {
    try {
      // Here you would typically integrate with Google OAuth signup
      // For now, we'll simulate a successful signup
      return { user: { id: 1, username: 'user@example.com' }, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const initialState = {
  user: localStorage.getItem('username') ? {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('userRole')
  } : null,
  role: localStorage.getItem('userRole') || null,
  isAuthenticated: !!localStorage.getItem('userRole'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('visibleComponents');
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup with Google
      .addCase(signupWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(signupWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login with Credentials
      .addCase(loginWithCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setRole, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
