import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { FeedbackService } from "@/lib/services/feedback-service";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getAuthenticatedUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabase = await createClient();
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    const updates = {
      status,
      is_resolved: status === "resolved"
    };
    
    const result = await FeedbackService.updateFeedback(id, updates, supabase);
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating feedback status:`, error);
    return NextResponse.json(
      { error: "Failed to update feedback status" },
      { status: 500 }
    );
  }
}