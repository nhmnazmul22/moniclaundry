import { dbConnect } from "@/lib/config/db";
import CustomerModel from "@/lib/models/CustomersModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const customerId = (await params).id;

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const customerId = (await params).id;
    const body = await request.json();

    // Update Delivery data
    const UpdatedCustomer = await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedCustomer) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update customer",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const customerId = (await params).id;

    if (!customerId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a customer id to delete customer",
        },
        { status: 404 }
      );
    }

    const deletedCustomer = await CustomerModel.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete customer",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedCustomer,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
