import { NextRequest, NextResponse } from "next/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email || email.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({
      emailAddress: [email.trim()],
      limit: 5,
    });

    const results = users.data
      .filter((u) => u.id !== user.id) // Don't return the current user
      .map((u) => ({
        id: u.id,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.emailAddresses[0]?.emailAddress || "",
        imageUrl: u.imageUrl,
      }));

    return NextResponse.json(results);
  } catch (err) {
    console.error("[users/search] error:", err);
    return NextResponse.json([]);
  }
}
