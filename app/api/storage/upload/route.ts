import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { StorageService } from "@/lib/services/storage-service";

export async function POST(request: NextRequest) {
  try {
      const userId = await getAuthenticatedUserId(request);
      if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const supabase = await createClient();

      const cleanupResponse = await StorageService.cleanupExistingAvatars(userId, supabase)

      if (!cleanupResponse.success) {
        return NextResponse.json({ error: 'Failed to cleanup existing avatars' }, { status: 500 })
      } 

      const formData = await request.formData()
      const file = formData.get('file') as File
      const bucket = formData.get('bucket') as string
      const path = formData.get('path') as string

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        )
      }
      
      const filePath = path || `${bucket}/${userId}/${Date.now()}-${file.name}`

      const uploadResponse = await StorageService.uploadFile(bucket, filePath, file, supabase, { upsert: true })

      if (uploadResponse.error) {
        return NextResponse.json({ error: uploadResponse.error }, { status: 500 })
      }

      return NextResponse.json(uploadResponse)
  } catch (error) {
      console.error('Error creating recurring expense:', error);
      return NextResponse.json({ error: 'Failed to create recurring expense' }, { status: 500 });
  }
}
