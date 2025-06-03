import { Entypo, Foundation, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

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

export const MaterialCommunityIconsIcon = ({ name, color }: IconProps) => (
    <MaterialCommunityIcons name={name} size={24} color={color} />
);

interface TabBarIconProps extends IconProps {
    type: 'material' | 'foundation' | 'entypo' | 'material-community';
}

export default function TabBarIcon({ type, name, color }: TabBarIconProps) {
    switch (type) {
        case 'material':
            return <MaterialIconsIcon name={name} color={color} />;
        case 'foundation':
            return <FoundationIcon name={name} color={color} />;
        case 'entypo':
            return <EntypoIcon name={name} color={color} />;
        case 'material-community':
            return <MaterialCommunityIconsIcon name={name} color={color} />;
        default:
            return <MaterialIconsIcon name={name} color={color} />;
    }
}
