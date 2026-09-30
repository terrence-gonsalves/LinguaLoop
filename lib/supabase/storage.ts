import * as FileSystem from 'expo-file-system';

import { Platform } from 'react-native';

import { decode as base64Decode } from 'base64-arraybuffer';

import { supabase } from '../supabase';

const AVATAR_BUCKET = 'avatars';

// ImageUpload always re-encodes to JPEG, so every avatar is <user_id>.jpg.
// the bucket's INSERT policy requires the name before the dot to be the uploader's id.
function avatarPath(userId: string) {
  return `${userId}.jpg`;
}

// uploads the avatar and returns the public URL to store in profiles.avatar_url.
// the ?v= timestamp changes on every upload so image caches pick up the new file.
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const path = avatarPath(userId);

  try {
    let body: ArrayBuffer | Blob;

    if (Platform.OS !== 'web') {

      // read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      body = base64Decode(base64);
    } else {

      // handle web upload
      const response = await fetch(uri);
      body = await response.blob();
    }

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, body, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    // the bucket is public, so this URL doesn't expire
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

    return `${data.publicUrl}?v=${Date.now()}`;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// deletes the user's avatar file. throws if nothing was deleted.
export async function deleteAvatar(userId: string): Promise<void> {

  // .jpeg and .png are names older app versions could have used
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([avatarPath(userId), `${userId}.jpeg`, `${userId}.png`]);

  if (error) {
    console.error('Error deleting avatar:', error);
    throw new Error('Failed to delete avatar');
  }

  if (!data || data.length === 0) {
    throw new Error('No avatar file was found to delete');
  }
}
