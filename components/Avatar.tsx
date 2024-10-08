import { Image, type ImageProps } from 'react-native';
import React from 'react';

export type AvatarImageProps = ImageProps & {
    width: number;
    image?: string;
};

export function Avatar({ width, image }: AvatarImageProps) {
  return (
    <>
        <Image style={{ width: width, aspectRatio: 1, borderRadius: 100 }} source={{ uri: image ? image : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2487&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }} />
    </>
  )
}