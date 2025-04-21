import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { FeedbackService } from "@/lib/services/feedback-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ status: string }> }
) {
  try {
    const { status } = await context.params;
    
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    const feedback = await FeedbackService.getFeedbackByStatus(status, supabase);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error(`Error fetching feedback with status ${status}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}