import { supabase } from '@/lib/supabase';

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'posts'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Upload multiple images
  async uploadImages(files: File[], folder: string = 'posts'): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  },

  // Convert base64 to File
  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  },

  // Delete image
  async deleteImage(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;
  },
};

