import { Suspense } from "react";
import NewCustomerFormWrapper from "./NewCustomerPage";

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Add New Customer</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <NewCustomerFormWrapper />
      </Suspense>
    </div>
  );
}
