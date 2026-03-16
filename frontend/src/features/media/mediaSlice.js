import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import mediaAPI from './mediaAPI';

export const fetchMediaAsync = createAsyncThunk('media/fetch', async (params = { page: 0, size: 5 }, thunkAPI) => {
  try {
    const response = await mediaAPI.list(params);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch media');
  }
});

export const uploadMediaAsync = createAsyncThunk('media/upload', async (payload, thunkAPI) => {
  try {
    const response = await mediaAPI.upload(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to upload media');
  }
});

export const deleteMediaAsync = createAsyncThunk('media/delete', async (id, thunkAPI) => {
  try {
    await mediaAPI.remove(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to delete media');
  }
});

const mediaSlice = createSlice({
  name: 'media',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMediaAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(uploadMediaAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(deleteMediaAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addMatcher((action) => action.type.startsWith('media/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('media/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mediaSlice.reducer;
