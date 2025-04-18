import { SupabaseClient } from "@supabase/supabase-js"

export const StorageService = {
  uploadFile: async (
    bucket: string,
    filePath: string,
    file: File,
    supabase: SupabaseClient,
    options?: { upsert?: boolean },
  ): Promise<{ url: string | null; error: Error | null }> => {
    try {
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: options?.upsert || false,
          cacheControl: '3600',
        })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return { url: data.publicUrl, error: null }
    } catch (error) {
      console.error("Error uploading file:", error)
      return { url: null, error: error as Error }
    }
  },

  cleanupExistingAvatars: async (userId: string, supabase: SupabaseClient) => {
    try {
      const { data: existingFiles, error } = await supabase.storage
        .from('user-avatars')
        .list(`${userId}`);

      if (error) throw error;
      
      if (existingFiles && existingFiles.length > 0) {
        const filePaths = existingFiles.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
          .from('user-avatars')
          .remove(filePaths);
          
        if (deleteError) throw deleteError;
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error cleaning up existing avatars:", error);
      return { success: false };
    }
  }
} 