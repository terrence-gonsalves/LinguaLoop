import { ScrollView, Pressable, Text, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { ParamListBase,  NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/Avatar';
import { DividerLine } from '@/components/DividerLine';

import styles from './styles';

export default function HomeScreen() {
    const navigation: NavigationProp<ParamListBase> = useNavigation();

    const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName);
    }

    // const confirmDelete = () => {
    //     Alert.alert("Delete Account", "Deleting your account is permanent and cannot be undone!", [
    //         {
    //             text: 'Cancel',
    //             style: 'cancel',
    //         },
    //         {
    //             text: 'Yes, delete',
    //             style: 'destructive',
    //             onPress: console.log('Account deleted, but not really yet!'),
    //         }
    //     ])
    // };

    return (
        
        <SafeAreaView style={styles.saWrapper}>
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
                style={ styles.container }>
                <ThemedView darkColor={'transparent'} style={styles.accountHeaderContainer}>
                    <Avatar width={100} />
                    <ThemedView darkColor={'transparent'} style={styles.accountHeaderTextContainer}>
                        <Text style={styles.accountTitle}>Name</Text>
                        <Text onPress={() => navigateToScreen('Profile')} style={styles.accountProfileLink}>View Profile</Text>
                    </ThemedView>
                </ThemedView>

                <DividerLine />

                <ThemedView darkColor={'transparent'} style={ styles.settingsOptionsContainer}>
                    <ThemedView darkColor={'transparent'} style={styles.settingsOptionsTextContainer}>
                        <Text>General</Text>
                    </ThemedView>
                    <Pressable onPress={() => navigateToScreen('languages')} style={ styles.settingsOptionsTop }>
                        <Text>Manage Languages</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('password')} style={ styles.settingsOptions }>
                        <Text>Password</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('notifications')} style={ styles.settingsOptions }>
                        <Text>Notifications</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('dailyGoal')} style={ styles.settingsOptionsBottom }>
                        <Text>Edit Daily Goal</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                </ThemedView>

                <ThemedView darkColor={'transparent'} style={ styles.settingsOptionsContainer}>
                    <ThemedView darkColor={'transparent'} style={styles.settingsOptionsTextContainer}>
                        <Text>Support</Text>
                    </ThemedView>
                    <Pressable onPress={() => navigateToScreen('contact')} style={ styles.settingsOptionsTop }>
                        <Text>Contact</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('feedback')} style={ styles.settingsOptions }>
                        <Text>Feedback</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('about')} style={ styles.settingsOptionsBottom }>
                        <Text>About</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                </ThemedView>

                <ThemedView darkColor={'transparents'} style={ styles.settingsOptionsContainer}>
                    <ThemedView darkColor={'transparent'} style={styles.settingsOptionsTextContainer}>
                        <Text>Privacy</Text>
                    </ThemedView>
                    <Pressable onPress={() => navigateToScreen('terms')} style={ styles.settingsOptions }>
                        <Text>Terms</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('eula')} style={ styles.settingsOptions }>
                        <Text>EULA</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                    <Pressable onPress={() => navigateToScreen('acknowledgements')} style={ styles.settingsOptionsBottom }>
                        <Text>Acknowledgments</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={30} />
                    </Pressable>
                </ThemedView>

                <ThemedView darkColor={'transparent'}  style={styles.btnsContainer}>
                    <Text>{Application.nativeApplicationVersion}</Text>
                    <Text style={styles.logoutBtn}>LOG OUT</Text>
                    <Text style={styles.delete}>Delete Account</Text>
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}