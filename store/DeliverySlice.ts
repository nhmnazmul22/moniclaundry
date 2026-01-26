import api from "@/lib/config/axios";
import { Delivery } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Delivery[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchDelivery = createAsyncThunk<Delivery[], string>(
  "delivery/fetchDelivery",
  async (branchId) => {
    const response = await api.get(`/api/deliveries?branch_id=${branchId}`);
    return response.data.data;
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchDelivery.fulfilled,
        (state, action: PayloadAction<Delivery[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default deliverySlice.reducer;
