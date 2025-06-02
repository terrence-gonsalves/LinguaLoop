import { Colors } from '@/constants/Colors';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface DefaultAvatarProps {
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

export default function DefaultAvatar({
  size = 100,
  backgroundColor = Colors.light.rust,
  foregroundColor = '#FFFFFF',
}: DefaultAvatarProps) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="50" fill={backgroundColor} />
        <Circle cx="50" cy="38" r="18" fill={foregroundColor} />
        <Path
          d="M50 65c-16.5 0-30 11-30 24.5V100h60V89.5C80 76 66.5 65 50 65z"
          fill={foregroundColor}
        />
      </Svg>
    </View>
  );
} 