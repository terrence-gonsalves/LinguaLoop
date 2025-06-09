import { supabase } from '../../app/lib/supabase';

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  try {

    // convert image URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // get file extension from URI
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}.${extension}`;

    // upload to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        upsert: true,
        contentType: `image/${extension}`,
      });

    if (uploadError) {
      throw uploadError;
    }

    // get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }
}

export async function deleteAvatar(userId: string): Promise<void> {
  try {

    // first, try to delete with .jpg extension
    let { error: jpgError } = await supabase.storage
      .from('avatars')
      .remove([`${userId}.jpg`]);

    // if not found, try .jpeg
    if (jpgError) {
      let { error: jpegError } = await supabase.storage
        .from('avatars')
        .remove([`${userId}.jpeg`]);

      // if not found, try .png
      if (jpegError) {
        let { error: pngError } = await supabase.storage
          .from('avatars')
          .remove([`${userId}.png`]);

        // if all attempts fail, throw error only if it's not a "not found" error
        if (pngError && !pngError.message.includes('not found')) {
          throw pngError;
        }
      }
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw new Error('Failed to delete avatar');
  }
} 