import { Entypo, Foundation, MaterialIcons } from '@expo/vector-icons';

interface IconProps {
    name: any;
    color: string;
}

export const MaterialIconsIcon = ({ name, color }: IconProps) => (
    <MaterialIcons name={name} size={24} color={color} />
);

export const FoundationIcon = ({ name, color }: IconProps) => (
    <Foundation name={name} size={24} color={color} />
);

export const EntypoIcon = ({ name, color }: IconProps) => (
    <Entypo name={name} size={24} color={color} />
); 