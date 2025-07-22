import * as FileSystem from 'expo-file-system';

import { Platform } from 'react-native';

import { decode as base64Decode } from 'base64-arraybuffer';

import { supabase } from '../supabase';

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  try {

    // get file extension from URI
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}.${extension}`;
    const contentType = `image/${extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'png'}`;

    if (Platform.OS !== 'web') {

      // read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      // upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, base64Decode(base64), {
          upsert: true,
          contentType
        });

      if (uploadError) throw uploadError;

    } else {

      // handle web upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: blob.type,
        });

      if (uploadError) throw uploadError;
    }

    // get the download URL for the uploaded file
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(fileName, 60 * 60 * 24); // 24 hour expiry

    if (!data?.signedUrl) {
      throw new Error('Failed to get download URL');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function getAvatarUrl(userId: string): Promise<string | null> {
  try {
    console.log('Getting avatar URL for user:', userId);

    // list files to get the correct extension
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', {
        limit: 1,
        search: userId
      });

    if (listError) {
      console.error('Error listing avatar files:', listError);
      return null;
    }

    if (!files || files.length === 0) {
      console.log('No avatar files found for user:', userId);
      return null;
    }

    console.log('Found avatar file:', files[0].name);

    // get signed URL for the file
    const { data, error: urlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(files[0].name, 60 * 60 * 24); // 24 hour expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return null;
    }

    console.log('Generated signed URL for user:', userId);
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    return null;
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
