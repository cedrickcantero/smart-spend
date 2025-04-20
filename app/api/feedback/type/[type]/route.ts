import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { FeedbackService } from "@/lib/services/feedback-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const feedbackType = params.type;
    
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    // Use the service instead of direct Supabase query
    const feedback = await FeedbackService.getFeedbackByType(feedbackType, supabase);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error(`Error fetching feedback with type ${params.type}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
} 