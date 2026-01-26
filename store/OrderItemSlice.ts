import api from "@/lib/config/axios";
import { OrderItem } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: OrderItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrderItems = createAsyncThunk<OrderItem[], string>(
  "orderItems/fetchOrderItems",
  async (orderId: string) => {
    const response = await api.get(`/api/order-items?order_id=${orderId}`);
    return response.data.data;
  }
);

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchOrderItems.fulfilled,
        (state, action: PayloadAction<OrderItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default orderItemsSlice.reducer;
