import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'item-images';

export async function uploadItemImage(file: File, itemId: string): Promise<string> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${itemId}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteItemImage(imageUrl: string): Promise<void> {
  // Extract path from URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const bucketIndex = pathParts.indexOf(BUCKET_NAME);
  
  if (bucketIndex === -1) return;
  
  const filePath = pathParts.slice(bucketIndex + 1).join('/');

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
}

export function compressImage(file: File, maxWidth: number = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
