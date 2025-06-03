import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

type IconProps = {
  name: any;
  color: string;
};

export function MaterialIconsIcon({ name, color }: IconProps) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...{ name, color }} />;
}

export function MaterialCommunityIconsIcon({ name, color }: IconProps) {
  return <MaterialCommunityIcons size={24} style={{ marginBottom: -3 }} {...{ name, color }} />;
} 