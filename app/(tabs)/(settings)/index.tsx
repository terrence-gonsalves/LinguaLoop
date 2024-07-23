import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { ParamListBase,  NavigationProp } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import styles from './styles';

export default function HomeScreen() {
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName);
  }
  return (
    <ScrollView style={ styles.container }>
        <View style={ styles.settingsOptionsContainer}>
            <View style={styles.settingsOptionsTextContainer}>
                <Text>General</Text>
            </View>
            <Pressable onPress={() => navigateToScreen('ManageLanguagesScreen')} style={ styles.settingsOptionsTop }>
                <Text>Manage Languages</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('PasswordResetScreen')} style={ styles.settingsOptions }>
                <Text>Password</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('NotificationsScreen')} style={ styles.settingsOptions }>
                <Text>Notifications</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('EditDailyGoalsScreen')} style={ styles.settingsOptionsBottom }>
                <Text>Edit Daily Goal</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
        </View>

        <View style={ styles.settingsOptionsContainer}>
            <View style={styles.settingsOptionsTextContainer}>
                <Text>Support</Text>
            </View>
            <Pressable onPress={() => navigateToScreen('ManageLanguagesScreen')} style={ styles.settingsOptionsTop }>
                <Text>Contact</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('PasswordResetScreen')} style={ styles.settingsOptions }>
                <Text>Feedback</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('About')} style={ styles.settingsOptionsBottom }>
                <Text>About</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} />
            </Pressable>
        </View>
    </ScrollView>
  );
}