import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();

    const [
      { count: productsCount, error: productsErr },
      { count: customersCount, error: customersErr },
      { count: ordersCount, error: ordersErr },
      { data: revenueData, error: revenueErr },
      { data: latestOrders, error: latestOrdersErr },
    ] = await Promise.all([
      admin.from("products").select("*", { count: "exact", head: true }),
      admin.from("customers").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("orders").select("total"),
      admin
        .from("orders")
        .select("id,status,total,created_at,customers(first_name,last_name,email)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (productsErr || customersErr || ordersErr || revenueErr || latestOrdersErr) {
      throw (
        productsErr ||
        customersErr ||
        ordersErr ||
        revenueErr ||
        latestOrdersErr
      );
    }

    const totalRevenue = (revenueData || []).reduce(
      (sum, row) => sum + Number(row.total || 0),
      0
    );

    const pendingOrders = (latestOrders || []).filter(
      (order) => order.status === "pending" || order.status === "processing"
    ).length;

    return NextResponse.json({
      productsCount: productsCount || 0,
      customersCount: customersCount || 0,
      ordersCount: ordersCount || 0,
      totalRevenue,
      pendingOrders,
      latestOrders: latestOrders || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard statistics." },
      { status: 500 }
    );
  }
}
