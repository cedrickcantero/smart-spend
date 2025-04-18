import { api } from "@/lib/services/api-service"

export const StorageService = {
  uploadFile: async (file: File, userId: string): Promise<{url?: string, error?: string}> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('bucket', 'user-avatars');
      formData.append('path', `/${userId}/${file.name}`);

      return await api.post<{url: string}>("/api/storage/upload", formData, true);
    } catch (error) {
      console.error("Error in uploadFile:", error);
      return { error: error instanceof Error ? error.message : "Failed to upload file" };
    }
  }
}
