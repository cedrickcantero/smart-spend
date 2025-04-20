import { getAuthenticatedUserId } from '@/lib/server/auth';
import { FeedbackService } from '@/lib/services/feedback-service';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    // For admin page, we want all feedback not just from this user
    const feedback = await FeedbackService.getAllFeedback(supabase);
    
    // If we have an error from the feedback service
    if (feedback && 'error' in feedback) {
      return NextResponse.json({ error: feedback.error }, { status: 500 });
    }
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const feedbackData = await request.json();
    
    if (!feedbackData.feedback_text) {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      );
    }
    
    const feedback = await FeedbackService.createFeedback(feedbackData, userId, supabase);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}