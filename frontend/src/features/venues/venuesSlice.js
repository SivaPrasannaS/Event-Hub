import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import venuesAPI from './venuesAPI';

export const fetchVenuesAsync = createAsyncThunk('venues/fetch', async (params = { page: 0, size: 5 }, thunkAPI) => {
  try {
    const response = await venuesAPI.list(params);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch venues');
  }
});

export const createVenueAsync = createAsyncThunk('venues/create', async (payload, thunkAPI) => {
  try {
    const response = await venuesAPI.create(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to create venue');
  }
});

export const deleteVenueAsync = createAsyncThunk('venues/delete', async (id, thunkAPI) => {
  try {
    await venuesAPI.remove(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to delete venue');
  }
});

const venuesSlice = createSlice({
  name: 'venues',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenuesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(createVenueAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(deleteVenueAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addMatcher((action) => action.type.startsWith('venues/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('venues/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default venuesSlice.reducer;
