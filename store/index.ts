import branchSlice from "@/store/BranchSlice";
import customerReportSlice from "@/store/CusotomerReportSlice";
import { default as customerSlice } from "@/store/CustomerSlice";
import deliverySlice from "@/store/DeliverySlice";
import depositReportSlice from "@/store/depositReportSlice";
import depositTypesReducer from "@/store/depositTypesSlice";
import orderItemsSlice from "@/store/OrderItemSlice";
import orderSlice from "@/store/orderSlice";
import paginationSlice from "@/store/paginationSlice";
import paymentsSlice from "@/store/PaymentSlice";
import serviceSlice from "@/store/ServiceSlice";
import staffsSlice from "@/store/StaffSlice";
import transactionsReducer from "@/store/transactionsSlice";
import userSlice from "@/store/userSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    userReducer: userSlice,
    branchReducer: branchSlice,
    orderReducer: orderSlice,
    customerReducer: customerSlice,
    serviceReducer: serviceSlice,
    paginationReducer: paginationSlice,
    orderItemsReducer: orderItemsSlice,
    staffsReducer: staffsSlice,
    deliveryReducer: deliverySlice,
    depositTypes: depositTypesReducer,
    transactions: transactionsReducer,
    depositReport: depositReportSlice,
    customerReportReducer: customerReportSlice,
    paymentsReducer: paymentsSlice,
  },
});

// Types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
