"use client";

import { useSearchParams } from "next/navigation";

export default function OrderEditAndDetailsPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return <div>Order ID: {orderId}</div>;
}
