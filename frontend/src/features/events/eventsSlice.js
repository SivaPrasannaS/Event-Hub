import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import eventsAPI from './eventsAPI';

export const fetchEventsAsync = createAsyncThunk('events/fetch', async (params = { page: 0, size: 5 }, thunkAPI) => {
  try {
    const response = await eventsAPI.list(params);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch events');
  }
});

export const fetchEventByIdAsync = createAsyncThunk('events/getById', async (id, thunkAPI) => {
  try {
    const response = await eventsAPI.getById(id);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch event');
  }
});

export const createEventAsync = createAsyncThunk('events/create', async (payload, thunkAPI) => {
  try {
    const response = await eventsAPI.create(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to create event');
  }
});

export const updateEventAsync = createAsyncThunk('events/update', async ({ id, payload }, thunkAPI) => {
  try {
    const response = await eventsAPI.update(id, payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to update event');
  }
});

export const deleteEventAsync = createAsyncThunk('events/delete', async (id, thunkAPI) => {
  try {
    await eventsAPI.remove(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to delete event');
  }
});

export const publishEventAsync = createAsyncThunk('events/publish', async ({ id, publish }, thunkAPI) => {
  try {
    const response = await eventsAPI.publish(id, publish);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to publish event');
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: { items: [], total: 0, page: 0, loading: false, error: null, selectedItem: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchEventByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(createEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(updateEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(deleteEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(publishEventAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addMatcher((action) => action.type.startsWith('events/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('events/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventsSlice.reducer;
