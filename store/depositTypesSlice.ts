import api from "@/lib/config/axios";
import type { DepositType } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialState {
  items: DepositType[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch deposit types
export const fetchDepositTypes = createAsyncThunk<DepositType[], string>(
  "depositTypes/fetchDepositTypes",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/deposit-types?branch_id=${branchId}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deposit types"
      );
    }
  }
);

// Create deposit type
export const createDepositType = createAsyncThunk<
  DepositType,
  Omit<DepositType, "_id">
>(
  "depositTypes/createDepositType",
  async (depositTypeData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/deposit-types", depositTypeData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create deposit type"
      );
    }
  }
);

// Update deposit type
export const updateDepositType = createAsyncThunk<
  DepositType,
  { id: string; data: Partial<DepositType> }
>(
  "depositTypes/updateDepositType",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/deposit-types/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update deposit type"
      );
    }
  }
);

// Delete deposit type
export const deleteDepositType = createAsyncThunk<string, string>(
  "depositTypes/deleteDepositType",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/deposit-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete deposit type"
      );
    }
  }
);

const depositTypesSlice = createSlice({
  name: "depositTypes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch deposit types
      .addCase(fetchDepositTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepositTypes.fulfilled,
        (state, action: PayloadAction<DepositType[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchDepositTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create deposit type
      .addCase(createDepositType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createDepositType.fulfilled,
        (state, action: PayloadAction<DepositType>) => {
          state.loading = false;
          state.items.push(action.payload);
        }
      )
      .addCase(createDepositType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update deposit type
      .addCase(
        updateDepositType.fulfilled,
        (state, action: PayloadAction<DepositType>) => {
          const index = state.items.findIndex(
            (dt) => dt._id === action.payload._id
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )
      // Delete deposit type
      .addCase(
        deleteDepositType.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((dt) => dt._id !== action.payload);
        }
      );
  },
});

export const { clearError } = depositTypesSlice.actions;
export default depositTypesSlice.reducer;
