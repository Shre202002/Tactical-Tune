import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCollection } from "@/server/database.server";
import type { OrderDocument } from "@/server/store.server";
import { requireUser } from "@/server/auth.server";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const user = await requireUser(); // Ensure user is logged in
    
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      // In development if no secret is set, we might bypass verification for testing if desired.
      // But for security, we should throw an error.
      return NextResponse.json({ error: "Razorpay secret not configured on server" }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Signature verified, update the order
    const orders = await getCollection<OrderDocument>("orders");
    const result = await orders.updateOne(
      { razorpay_order_id, user_id: new ObjectId(user.id) },
      {
        $set: {
          status: "paid",
          payment_completed_at: new Date(),
          razorpay_payment_id,
          razorpay_signature,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
