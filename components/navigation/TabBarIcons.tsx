// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import { MaterialIcons, Foundation, Entypo, FontAwesome } from '@expo/vector-icons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function MaterialIcon({ style, ...rest }: IconProps<ComponentProps<typeof MaterialIcons>['name']>) {
    return <MaterialIcons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}

export function FoundationIcon({ style, ...rest }: IconProps<ComponentProps<typeof Foundation>['name']>) {
    return <Foundation size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}

export function EntypoIcon({ style, ...rest }: IconProps<ComponentProps<typeof Entypo>['name']>) {
    return <Entypo size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}

export function FontAwesomeIcon({ style, ...rest }: IconProps<ComponentProps<typeof FontAwesome>['name']>) {
    return <FontAwesome size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}
