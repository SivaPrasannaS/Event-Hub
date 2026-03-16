import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authAPI from './authAPI';
import tokenService from '../../services/tokenService';

const storedToken = tokenService.getAccessToken();
const storedRefresh = tokenService.getRefreshToken();

export const loginAsync = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const response = await authAPI.login(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerAsync = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const response = await authAPI.register(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const refreshTokenAsync = createAsyncThunk('auth/refresh', async (payload, thunkAPI) => {
  try {
    const response = await authAPI.refresh(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Token refresh failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: storedToken,
    refreshToken: storedRefresh,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      tokenService.clear();
    },
    setAccessToken(state, action) {
      state.token = action.payload;
      tokenService.setTokens({ accessToken: action.payload, refreshToken: state.refreshToken });
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.id, username: action.payload.username, roles: action.payload.roles };
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        tokenService.setTokens({ accessToken: action.payload.accessToken, refreshToken: action.payload.refreshToken });
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.id, username: action.payload.username, roles: action.payload.roles };
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        tokenService.setTokens({ accessToken: action.payload.accessToken, refreshToken: action.payload.refreshToken });
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshTokenAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        tokenService.setTokens({ accessToken: action.payload.accessToken, refreshToken: state.refreshToken });
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setAccessToken, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
