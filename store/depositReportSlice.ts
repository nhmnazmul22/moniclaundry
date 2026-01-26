import api from "@/lib/config/axios";
import type { DepositReportData } from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialState {
  data: DepositReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  data: null,
  loading: false,
  error: null,
};

// Fetch dashboard data
export const fetchDepositReportData = createAsyncThunk<
  DepositReportData,
  string
>("dashboard/fetchDepositReportData", async (branchId, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/api/reports/deposit?branch_id=${branchId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch dashboard data"
    );
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepositReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(
        fetchDepositReportData.fulfilled,
        (state, action: PayloadAction<DepositReportData>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchDepositReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
