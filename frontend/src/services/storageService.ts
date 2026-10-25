import { supabase } from '@/lib/supabase';

/** Max size for any single file / image upload field. */
export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
export const UPLOAD_MAX_MB = 20;

/** Total size of uploaded documents allowed per project. */
export const PROJECT_DOCUMENTS_TOTAL_MAX_BYTES = 50 * 1024 * 1024;
export const PROJECT_DOCUMENTS_TOTAL_MAX_MB = 50;

export const uploadMaxLabel = `${UPLOAD_MAX_MB} Mo`;
export const projectDocumentsTotalMaxLabel = `${PROJECT_DOCUMENTS_TOTAL_MAX_MB} Mo`;

export const isWithinUploadLimit = (file: File) => file.size <= UPLOAD_MAX_BYTES;

export const assertWithinUploadLimit = (file: File) => {
  if (!isWithinUploadLimit(file)) {
    throw new Error(`Chaque fichier doit faire ${uploadMaxLabel} maximum.`);
  }
};

export const formatUploadBytes = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 10) return `${Math.round(mb)} Mo`;
  if (mb >= 1) return `${mb.toFixed(1).replace(/\.0$/, "")} Mo`;
  const kb = bytes / 1024;
  if (kb >= 1) return `${Math.round(kb)} Ko`;
  return `${bytes} o`;
};

/** Keep files under the limit; returns rejected ones for UI messaging. */
export const partitionByUploadLimit = (files: File[]) => {
  const accepted: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    if (isWithinUploadLimit(file)) accepted.push(file);
    else rejected.push(file);
  }
  return { accepted, rejected };
};

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'posts'): Promise<string> {
    return this.uploadFile(file, folder);
  },

  /** Generic file upload (images, PDFs, …) with the global per-file cap. */
  async uploadFile(file: File, folder: string = 'posts'): Promise<string> {
    assertWithinUploadLimit(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) throw error;

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
