import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from '../../app/lib/supabase';

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  try {
    console.log('Starting avatar upload for user:', userId);
    console.log('Image URI:', uri);

    let fileName: string;

    // for React Native, we'll use the file URI directly
    if (Platform.OS !== 'web') {

      // get the file info to check size and type
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // validate file size (max 2MB)
      if (fileInfo.size > 2 * 1024 * 1024) {
        throw new Error('Image size exceeds 2MB limit');
      }

      // get file extension from URI
      const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      
      // ensure extension is valid
      if (!['jpg', 'jpeg', 'png'].includes(extension)) {
        throw new Error('Invalid file type. Only JPG and PNG are allowed.');
      }

      fileName = `${userId}.${extension}`;
      console.log('Upload details:', {
        bucket: 'avatars',
        fileName,
        size: fileInfo.size
      });

      try {

        // first try to read as base64
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Upload using base64 data
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, base64Data, {
            upsert: true,
            contentType: `image/${extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'png'}`,
          });

        if (uploadError) {
          throw uploadError;
        }

        console.log('Upload successful with base64, data:', data);
      } catch (base64Error) {
        console.error('Base64 upload failed, trying binary:', base64Error);

        // if base64 fails, try binary upload
        const binaryData = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, binaryData, {
            upsert: true,
            contentType: `image/${extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'png'}`,
          });

        if (uploadError) {
          console.error('Binary upload error:', uploadError);
          throw uploadError;
        }

        console.log('Upload successful with binary, data:', data);
      }
    } else {
      // web platform - use blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // validate blob size (max 2MB)
      if (blob.size > 2 * 1024 * 1024) {
        throw new Error('Image size exceeds 2MB limit');
      }

      // validate content type
      if (!blob.type.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // get file extension from blob type
      let extension = blob.type.split('/')[1]?.toLowerCase();
      if (!extension || extension === 'jpeg') {
        extension = 'jpg';
      }

      fileName = `${userId}.${extension}`;
      console.log('Upload details:', {
        bucket: 'avatars',
        fileName,
        contentType: blob.type,
        size: blob.size
      });

      // Upload the blob directly
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: blob.type,
        });

      if (uploadError) {
        console.error('Supabase upload error:', {
          message: uploadError.message,
          name: uploadError.name,
          error: uploadError
        });
        throw uploadError;
      }

      console.log('Upload successful, data:', data);
    }

    // get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);
    
    // Verify the upload by trying to fetch the image
    try {
      const checkResponse = await fetch(publicUrl);
      if (!checkResponse.ok) {
        throw new Error(`Failed to verify upload: ${checkResponse.status}`);
      }
      const contentLength = checkResponse.headers.get('content-length');
      console.log('Verified upload, content length:', contentLength);
    } catch (error) {
      console.error('Failed to verify upload:', error);
    }

    return publicUrl;
  } catch (error) {
    console.error('Detailed upload error:', {
      error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
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