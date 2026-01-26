import api from "@/lib/config/axios";
import { Expense } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk<Expense[], string>(
  "expenses/fetchExpenses",
  async (branchId) => {
    const response = await api.get(`/api/expenses?branch_id=${branchId}`);
    return response.data.data;
  }
);

const expensesSlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchExpenses.fulfilled,
        (state, action: PayloadAction<Expense[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default expensesSlice.reducer;
