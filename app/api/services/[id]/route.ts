import { dbConnect } from "@/lib/config/db";
import ServiceModel from "@/lib/models/ServicesModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const serviceId = (await params).id;
    const service = await ServiceModel.findById(serviceId);

    if (!service) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: service,
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
    const serviceId = (await params).id;
    const body = await request.json();

    // Update service data
    const UpdatedService = await ServiceModel.findByIdAndUpdate(
      serviceId,
      {
        ...body,
      },
      { new: true }
    );

    if (!UpdatedService) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to update service",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: UpdatedService,
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
    const serviceId = (await params).id;

    if (!serviceId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Please, insert a service id to delete service",
        },
        { status: 404 }
      );
    }

    const deletedService = await ServiceModel.findByIdAndDelete(serviceId);

    if (!deletedService) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to delete service",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Successful",
        data: deletedService,
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
