import { Entypo, Foundation, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

interface IconProps {
    name: any;
    color: string;
}

export const MaterialIconsIcon = ({ name, color }: IconProps) => {
    try {
        return <MaterialIcons name={name} size={24} color={color} />;
    } catch (error) {
        console.log('Error rendering MaterialIconsIcon:', error);
        return null;
    }
};

export const FoundationIcon = ({ name, color }: IconProps) => {
    try {
        return <Foundation name={name} size={24} color={color} />;
    } catch (error) {
        console.log('Error rendering FoundationIcon:', error);
        return null;
    }
};

export const EntypoIcon = ({ name, color }: IconProps) => {
    try {
        return <Entypo name={name} size={24} color={color} />;
    } catch (error) {
        console.log('Error rendering EntypoIcon:', error);
        return null;
    }
}; 

export const MaterialCommunityIconsIcon = ({ name, color }: IconProps) => {
    try {
        return <MaterialCommunityIcons name={name} size={24} color={color} />;
    } catch (error) {
        console.log('Error rendering MaterialCommunityIconsIcon:', error);
        return null;
    }
};

interface TabBarIconProps extends IconProps {
    type: 'material' | 'foundation' | 'entypo' | 'material-community';
}

export default function TabBarIcon({ type, name, color }: TabBarIconProps) {
    try {
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
    } catch (error) {
        console.log('Error rendering TabBarIcon:', error);
        return null;
    }
}
