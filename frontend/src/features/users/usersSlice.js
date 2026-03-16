import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import usersAPI from './usersAPI';

export const fetchUsersAsync = createAsyncThunk('users/fetch', async (_, thunkAPI) => {
  try {
    const response = await usersAPI.list();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch users');
  }
});

export const assignRoleAsync = createAsyncThunk('users/assignRole', async ({ id, payload }, thunkAPI) => {
  try {
    const response = await usersAPI.assignRole(id, payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to update user role');
  }
});

export const deactivateUserAsync = createAsyncThunk('users/deactivate', async (id, thunkAPI) => {
  try {
    const response = await usersAPI.deactivate(id);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to deactivate user');
  }
});

export const activateUserAsync = createAsyncThunk('users/activate', async (id, thunkAPI) => {
  try {
    const response = await usersAPI.activate(id);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to activate user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(assignRoleAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? { ...item, roles: action.payload.roles, active: action.payload.active } : item));
      })
      .addCase(deactivateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? { ...item, active: action.payload.active } : item));
      })
      .addCase(activateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? { ...item, active: action.payload.active } : item));
      })
      .addMatcher((action) => action.type.startsWith('users/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('users/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
