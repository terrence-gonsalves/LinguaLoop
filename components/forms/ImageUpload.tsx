import { MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Image as RNImage, StyleSheet, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';
import DefaultAvatar from '../DefaultAvatar';

interface ImageUploadProps {
  size?: number;
  currentImageUrl?: string | null;
  onImageSelected: (imageUri: string) => Promise<void>;
  onImageRemoved?: () => Promise<void>;
  letter?: string;
}

export function ImageUpload({ 
  size = 100, 
  currentImageUrl, 
  onImageSelected,
  onImageRemoved,
  letter = '?'
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const processImage = async (uri: string): Promise<string> => {
    try {
      console.log('Processing image:', uri);

      // first compress the image to reduce size
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7 }
      );

      console.log('Compressed image URI:', compressed.uri);

      // get dimensions of compressed image
      const { width: originalWidth, height: originalHeight } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        RNImage.getSize(compressed.uri, 
          (w: number, h: number) => resolve({ width: w, height: h }),
          (error: Error) => reject(error)
        );
      });

      console.log('Original dimensions:', { width: originalWidth, height: originalHeight });

      // calculate the crop dimensions for a square
      const cropSize = Math.min(originalWidth, originalHeight);
      const originX = Math.round((originalWidth - cropSize) / 2);
      const originY = Math.round((originalHeight - cropSize) / 2);

      // crop to square
      const cropped = await ImageManipulator.manipulateAsync(
        compressed.uri,
        [{ crop: { originX, originY, width: cropSize, height: cropSize } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 }
      );

      console.log('Cropped image URI:', cropped.uri);

      // finally resize to target size (512x512)
      const final = await ImageManipulator.manipulateAsync(
        cropped.uri,
        [{ resize: { width: 512, height: 512 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 }
      );

      console.log('Final image URI:', final.uri);
      return final.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('Selected image URI:', result.assets[0].uri);
        const processedUri = await processImage(result.assets[0].uri);
        setSelectedImage(processedUri);
        await onImageSelected(processedUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
      console.error('Error picking/processing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      if (onImageRemoved) {
        await onImageRemoved();
      }
      setSelectedImage(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove image');
      console.error('Error removing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const imageSource = selectedImage || currentImageUrl || null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.text} />
        </View>
      ) : imageSource ? (
        <>
          <ExpoImage
            source={{ uri: imageSource }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Pressable
            style={styles.removeButton}
            onPress={handleRemove}
          >
            <MaterialIcons name="close" size={20} color="white" />
          </Pressable>
        </>
      ) : (
        <Pressable onPress={pickImage} style={styles.defaultContainer}>
          <DefaultAvatar size={size} letter={letter} />
          <View style={styles.uploadIcon}>
            <MaterialIcons name="add-a-photo" size={20} color="white" />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  defaultContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 100,
  },
  removeButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.error,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.text,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 