import { StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/Avatar';

import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function Dashboard() {

  // mock data - replace with actual data in a real app
  const languages = [
    { name: 'Spanish', totalTime: 120, streak: 5 },
    { name: 'French', totalTime: 90, streak: 3 },
    { name: 'Japanese', totalTime: 60, streak: 1 },
  ];

  const recentActivities = [
    { language: 'Spanish', activity: 'Listening', duration: 15 },
    { language: 'French', activity: 'Reading', duration: 20 },
    { language: 'Japanese', activity: 'Speaking', duration: 10 },
  ];

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.contentContainer}>
          <ThemedView>
            <ThemedView style={styles.headerWrapper}>
              <ThemedView>
                <ThemedText style={styles.boldText}>Current language</ThemedText>
                <ThemedText>Spanish</ThemedText>
              </ThemedView>
              <Pressable hitSlop={20}>
                <Avatar width={75} />
              </Pressable>
            </ThemedView>
            <ThemedView style={styles.nameTextWrapper}>
              <ThemedText style={styles.nameText}>Hello{ "\n" }Terrence Gonsalves</ThemedText>
            </ThemedView>
            <ThemedView>
              <ThemedView style={styles.dailyGoalWrapper}>
                <ThemedText style={styles.dailyGoalText}>Daily Goal</ThemedText>
                <ThemedView style={styles.dailyGoalTracker}>
                  <ThemedText>0/60 min(s)</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.informationWrapper}>
                <ThemedText style={styles.informationTitle}>Your Activity</ThemedText>
                <ThemedView style={styles.informationContentWrapper}>
                  <ThemedText>Current Streak</ThemedText>
                  <ThemedText>14 day(s)</ThemedText>
                </ThemedView>
                <ThemedView style={styles.informationContentWrapper}>
                  <ThemedText>Weeks in a Row</ThemedText>
                  <ThemedText>3</ThemedText>
                </ThemedView>
                <ThemedView>
                  <ThemedText>This is the calendar</ThemedText>
                </ThemedView>
              </ThemedView> 
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.languagesOverview}>
          <ThemedText style={styles.sectionTitle}>Your Languages</ThemedText>

          {languages.map((lang, index) => (
            <ThemedView key={index} style={styles.languageItem}>
              <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
              <ThemedText>Total time: {lang.totalTime} min</ThemedText>
              <ThemedText>Streak: {lang.streak} days</ThemedText>
            </ThemedView>
          ))}

        </ThemedView>

        <ThemedView style={styles.recentActivities}>
          <ThemedText style={styles.sectionTitle}>Recent Activities</ThemedText>

          {recentActivities.map((activity, index) => (
            <ThemedView key={index} style={styles.activityItem}>
              <ThemedText>{activity.language}: {activity.activity}</ThemedText>
              <ThemedText>{activity.duration} min</ThemedText>
            </ThemedView>
          ))}

        </ThemedView>

        <TouchableOpacity style={styles.startButton}>
          <Ionicons name="play-circle" size={24} color="white" />
          <ThemedText style={styles.startButtonText}>Start New Session</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },

    contentContainer: {
      padding: 15,
  },
  contentLanguageContainer: {
      padding: 15,
      flex: 1,
  },
  headerWrapper: {
      flex: 1, 
      justifyContent: 'space-between', 
      flexDirection: 'row', 
      height: 100
  },
  boldText: {
      fontWeight: Fonts.weight.bold,
  },
  nameTextWrapper: {
      paddingLeft: 25, 
      marginBottom: 15
  },
  nameText: {
      fontSize: 45, 
      color: Colors.light.textPrimary
  },
  dailyGoalWrapper: {
      width: '100%', 
      padding: 20, 
      marginBottom: 20
  },
  dailyGoalText: {
      fontSize: 18, 
      fontWeight: Fonts.weight.bold, 
      color: Colors.light.textPrimary, 
      marginBottom: 15
  },
  dailyGoalTracker: {
      alignSelf: 'center', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderColor: 'lightgrey', 
      width: 200, 
      height: 200, 
      borderWidth: 10, 
      borderRadius: 100 
  },
  informationWrapper: {
      width: '100%', 
      backgroundColor: '#F7F8FB', 
      borderWidth: 1, 
      borderColor:'#F7F8FB', 
      borderRadius: 10, 
      padding: 20,  
      marginBottom: 20
  },
  informationTitle: {
      fontSize: 18, 
      fontWeight: Fonts.weight.bold, 
      color: 'black', 
      marginBottom: 15
  },
  informationContentWrapper: {
      flex: 1, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 20
  },
  levelWrapper: {
      flex: 1, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-end'
  },
  levelContent: {
      width: 40, 
      backgroundColor: 'lightgrey', 
      borderRadius: 10
  },
  logoContainer: {
    flex: 1,
    alignSelf: 'center',
  },
  logoImg: {
      width: 170,
  },
  landingPageImage: {
      flex: 1,
      width: 250,
      height: 250,
      resizeMode: 'contain'
  },
  bodyText: {
      color: Colors.light.textSecondary,
      fontSize: Fonts.size.bodyCopy,
      marginBottom: 20,
  },
  modelContent: {
    backgroundColor: Colors.light.drab,
    padding: 22,
    borderTopRightRadius: 17,
    borderTopLeftRadius: 17,
  },
  modelContentTitle: {
    fontSize: 20,
    color: Colors.light.textTertiary,
    marginBottom: 20,
  },
  contentView: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  countryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: Colors.light.borders,
      backgroundColor: Colors.light.ice,
      padding: 20,
      marginBottom: 10
  },
  countryName: {
      fontSize: Fonts.size.btnLabel
  },

    title: {
      fontSize: 24,
      fontWeight: Fonts.weight.bold,
      textAlign: 'center',
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    languagesOverview: {
      backgroundColor: Colors.light.background,
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 15,
      marginBottom: 20,
    },
    languageItem: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
    },
    languageName: {
      fontWeight: Fonts.weight.bold,
      marginBottom: 5,
    },
    recentActivities: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 15,
      marginBottom: 20,
    },
    activityItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    startButton: {
      backgroundColor: '#4CAF50',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 15,
      marginBottom: 20,
    },
    startButtonText: {
      color: 'white',
      fontSize: 18,
      marginLeft: 10,
    },
  });