import api from "@/lib/config/axios";
import { CustomerTransactionReport } from "@/types"; // make sure this matches your report type
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: CustomerTransactionReport[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

// ⏬ Async Thunk for fetching customer report data
export const fetchCustomerReport = createAsyncThunk<
  CustomerTransactionReport[],
  { branchId?: string; startDate?: string; endDate?: string }
>("customerReport/fetch", async ({ branchId, startDate, endDate }) => {
  const params = new URLSearchParams();
  if (branchId) params.append("branch_id", branchId);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const response = await api.get(`/api/reports/customer-report?${params.toString()}`);
  return response.data.data;
});

const customerReportSlice = createSlice({
  name: "customerReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchCustomerReport.fulfilled,
        (state, action: PayloadAction<CustomerTransactionReport[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default customerReportSlice.reducer;
