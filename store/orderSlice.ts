import api from "@/lib/config/axios";
import { Order } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk<Order[], string>(
  "orders/fetchOrders",
  async (branchId) => {
    const response = await api.get(`/api/orders?branch_id=${branchId}`);
    return response.data.data;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default orderSlice.reducer;
