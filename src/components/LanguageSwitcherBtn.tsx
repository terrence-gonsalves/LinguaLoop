import { 
    Image, 
    type ImageProps,
    View, 
    ScrollView, 
    StyleSheet, 
    Dimensions,
    Pressable
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '@/src/constants/Colors';

type Props = {
    onPress: () => void;
};

export default function LanguageSwitcherBtn({ onPress }: Props) {
  return (
   <View style={styles.flagBG}>
        <Pressable 
            style={styles.buttonContainer}           
            hitSlop={20}
            onPress={onPress}>
            <Image source={require('@/assets/images/Spain.png')} style={styles.imageIcon} />
            <MaterialCommunityIcons name="chevron-down" size={25} color={Colors.light.drab} />
        </Pressable>
    </View>
  )
}
const styles = StyleSheet.create({
    flagBG: {
        borderWidth: 1,
        borderRadius: 25,
        borderColor: Colors.light.borders,
        backgroundColor: Colors.light.generalBG,
        marginRight: 10,
        width: 60,
        padding: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    imageIcon: {
        width: 22,
        height: 22,
    },
});