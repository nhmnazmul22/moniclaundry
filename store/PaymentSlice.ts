import api from "@/lib/config/axios";
import { Payment } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk<Payment[], string>(
  "delivery/fetchDelivery",
  async (branchId) => {
    const response = await api.get(`/api/payments?branch_id=${branchId}`);
    return response.data.data;
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchPayments.fulfilled,
        (state, action: PayloadAction<Payment[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default paymentsSlice.reducer;
