import api from "@/lib/config/axios";
import type { Customer } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialState {
  items: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch customers
export const fetchCustomers = createAsyncThunk<Customer[], string>(
  "customer/fetchCustomers",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customer?branch_id=${branchId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

// Purchase deposit
export const purchaseDeposit = createAsyncThunk<
  { customer: Customer; transaction: any; deposit_type: any },
  {
    customer_id: string;
    deposit_type_id: string;
    has_expiry: boolean;
    expiry_date?: string;
    processed_by?: string;
  }
>("customer/purchaseDeposit", async (depositData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/deposits/purchase", depositData);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to purchase deposit"
    );
  }
});

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCustomerBalance: (
      state,
      action: PayloadAction<{ customerId: string; newBalance: number }>
    ) => {
      const customer = state.items.find(
        (c) => c._id === action.payload.customerId
      );
      if (customer) {
        customer.deposit_balance = action.payload.newBalance;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchCustomers.fulfilled,
        (state, action: PayloadAction<Customer[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = [];
      })
      // Purchase deposit
      .addCase(purchaseDeposit.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (c) => c._id === action.payload.customer._id
        );
        if (index !== -1) {
          state.items[index] = action.payload.customer;
        }
      });
  },
});

export const { clearError, updateCustomerBalance } = customersSlice.actions;
export default customersSlice.reducer;
