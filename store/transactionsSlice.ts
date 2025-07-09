import api from "@/lib/config/axios";
import type { Transaction } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  processing: boolean;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
  processing: false,
};

// Fetch transactions
export const fetchTransactions = createAsyncThunk<
  Transaction[],
  { branchId: string; limit?: number }
>(
  "transactions/fetchTransactions",
  async ({ branchId, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/transactions?branch_id=${branchId}&limit=${limit}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);

// Process laundry transaction
export const processLaundryTransaction = createAsyncThunk<
  { transaction: Transaction; customer: any; payment_breakdown: any },
  {
    customer_id: string;
    branch_id: string;
    amount: number;
    payment_method: string;
    deposit_amount?: number;
    cash_amount?: number;
    description?: string;
    processed_by?: string;
  }
>(
  "transactions/processLaundryTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/api/transactions/laundry",
        transactionData
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process transaction"
      );
    }
  }
);

// Cancel transaction
export const cancelTransaction = createAsyncThunk<
  any,
  { id: string; processed_by?: string; reason?: string }
>(
  "transactions/cancelTransaction",
  async ({ id, processed_by, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/transactions/${id}/cancel`, {
        processed_by,
        reason,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel transaction"
      );
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchTransactions.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = [];
      })
      // Process laundry transaction
      .addCase(processLaundryTransaction.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processLaundryTransaction.fulfilled, (state, action) => {
        state.processing = false;
        state.items.unshift(action.payload.transaction);
      })
      .addCase(processLaundryTransaction.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      })
      // Cancel transaction
      .addCase(cancelTransaction.fulfilled, (state, action) => {
        // Update the cancelled transaction in the list
        const index = state.items.findIndex(
          (t) => t._id === action.payload.cancelled_transaction._id
        );
        if (index !== -1) {
          state.items[index].status = "cancelled";
        }
      });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
