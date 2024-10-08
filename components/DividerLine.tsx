import { View, StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';


export function DividerLine() {
  return (
    <View style={styles.dividerLine} />
  )
}

const styles = StyleSheet.create({
    dividerLine: {
        paddingTop: 30, 
        borderBottomColor: Colors.light.outLineBtnText, 
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: 20
    },
});