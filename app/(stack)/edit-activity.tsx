
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

export default function EditActivityScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.keyboardContainer}
                bottomOffset={50}
                style={styles.keyboardAvoidingView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}> 
                    <Text>Edit Activity Screen</Text>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
      },
      keyboardContainer: {
        padding: 16,
        gap: 16,
      },
      keyboardAvoidingView: {
        flex: 1, 
      },
      content: {
        padding: 16,
      },
});