import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import categoriesAPI from './categoriesAPI';

export const fetchCategoriesAsync = createAsyncThunk('categories/fetch', async (_, thunkAPI) => {
  try {
    const response = await categoriesAPI.list();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch categories');
  }
});

export const createCategoryAsync = createAsyncThunk('categories/create', async (payload, thunkAPI) => {
  try {
    const response = await categoriesAPI.create(payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to create category');
  }
});

export const updateCategoryAsync = createAsyncThunk('categories/update', async ({ id, payload }, thunkAPI) => {
  try {
    const response = await categoriesAPI.update(id, payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to update category');
  }
});

export const deleteCategoryAsync = createAsyncThunk('categories/delete', async (id, thunkAPI) => {
  try {
    await categoriesAPI.remove(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to delete category');
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addMatcher((action) => action.type.startsWith('categories/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('categories/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
