import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Pressable, 
  TouchableOpacity,
  Image
} from 'react-native';
import { 
  Card, 
  Surface, 
  Button, 
  Divider,
  Text,
  SegmentedButtons,
  ProgressBar
} from 'react-native-paper';
import {
  LineChart,
  BarChart,
  ProgressChart
} from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import AntDesign from '@expo/vector-icons/AntDesign';

import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';
// import { Colors } from '@/src/constants/Colors';
// import { Fonts } from '@/src/constants/Fonts';
import { Avatar } from '@/src/components/Avatar';

// Interfaces for type safety
interface ChartDataset {
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface LanguageProgressData {
  weekly: ChartData;
  monthly: ChartData;
}

interface ProgressDataStructure {
  [language: string]: LanguageProgressData;
}

const { width } = Dimensions.get('window');
const height = 220;

const DashboardScreen = () => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Spanish');

  // mock data for languages and activities
  const languages = [
    { id: 1, name: 'Spanish', totalHoursWeek: 7.5, streak: 15, most: 'Speaking' },
    { id: 2, name: 'French', totalHoursWeek: 5, streak: 10, most: 'Reading' },
    { id: 3, name: 'Japanese', totalHoursWeek: 2.3, streak: 5, most: 'Listening' }
  ];

  const recentActivities = [
    { id: 1, language: 'Spanish', type: 'Listening', duration: 30 },
    { id: 2, language: 'French', type: 'Reading', duration: 45 },
    { id: 3, language: 'Japanese', type: 'Speaking', duration: 20 }
  ];

  //const languagesChart: string[] = ['Spanish', 'French', 'Japanese'];

  const progressData: ProgressDataStructure = {
    Spanish: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [45, 60, 30, 50, 70, 55, 40]
        }]
      },
      monthly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [180, 220, 190, 210]
        }]
      }
    },
    // Similar data for other languages
    French: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [40, 50, 35, 45, 60, 50, 35]
        }]
      },
      monthly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [160, 190, 170, 180]
        }]
      }
    },
    // Similar data for other languages
    Japanese: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [15, 25, 35, 10, 5, 40, 30, 10]
        }]
      },
      monthly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [100, 50, 120, 30]
        }]
      }
    }
  };

  const barData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43]
      }
    ]
  };

  const progressChartData = [0.4, 0.6, 0.8];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
      padding: 0,
      margin: 0
    }
  };

  const graphStyle = {
    ...chartConfig.style
  }

  return (
    <>
      <StatusBar backgroundColor="#324755" style="light" />
      <SafeAreaView style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.headerWrapper}>
              <View style={styles.headerIcon}>
                <Pressable hitSlop={20}>
                  <Avatar width={60} borderWidth={1} borderColour='#F0F3F4' />
                </Pressable>
              </View>

              <View style={styles.flagIcon}>
                <Pressable hitSlop={20}>
                  <Image source={require('@/assets/images/Spain.png')} style={styles.imageIcon} />
                </Pressable>
              </View>

              <View style={styles.notificationBell}>
                <Pressable hitSlop={20}>
                  <AntDesign name="notification" size={20} color="#F0F3F4" />
                </Pressable>
              </View>
            </View>

            <View>
              <Text style={styles.nameText}>Hello, Terrence</Text>
              <Text style={styles.titleText}>Let's do something amazing today!</Text>
            </View>
          </View>

          <View style={styles.bodyContainer}>
            <Card style={styles.dashboardCard}>  
              <Card.Title title="Overview" /> 
              <Card.Content>              
                <View style={styles.languageSummaryWrapper}>
                  <View>
                    <Text># languages</Text>
                  </View>
                  <View>
                    <Text># h this week</Text>
                  </View>
                  <View>
                    <Text>top language</Text>
                  </View>
                </View>
              </Card.Content>
            </Card> 

            {/* Time Spent Chart */}
            <Card style={styles.dashboardCard}>
              <Card.Title title="Time Spent Learning" />
              <Card.Content>
                <LineChart
                  data={{
                    labels: progressData[selectedLanguage][timeFilter].labels,
                    datasets: progressData[selectedLanguage][timeFilter].datasets
                  }}
                  width={width - 60}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                />
              </Card.Content>
            </Card>

            {/* Progress Breakdown */}
            <Card style={styles.dashboardCard}>
              <Card.Title title="Acitivity Progress" />
              <Card.Content>

                {['Listening', 'Speaking', 'Reading', 'Writing'].map((skill) => (

                  <View key={skill} style={styles.skillProgress}>
                    <Text>{skill}</Text>
                    <ProgressBar 
                      progress={Math.random()} 
                      color="#007AFF" 
                      style={styles.progressBar} 
                    />
                  </View>

                ))}

              </Card.Content>
            </Card>            

            {/* RECENT ACTIVITIES */}
            <Surface style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <Text style={styles.subTitle}>Sub Title</Text>

              {recentActivities.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <Text>{activity.language} - {activity.type}</Text>
                  <Text>{activity.duration} min</Text>
                </View>
              ))}

            </Surface>

            <Surface style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>Your Languages</Text>

              {languages.map((lang, index) => (                
                  <View key={lang.id}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text>{lang.totalHoursWeek}h this week</Text>
                    <Text>{lang.streak} day streak</Text>
                    <Text>Most: {lang.most}</Text>
                  </View>
              ))}

            </Surface>
          </View>
        </ScrollView>

        {/* Start Tracking Button */}
        <TouchableOpacity style={styles.startButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bodyContainer: {    
    marginHorizontal: 15,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  contentLanguageContainer: {
    padding: 15,
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#324755',
    padding: 15,
    marginBottom: 20,
  },
  headerWrapper: {
    flexDirection: 'row', 
    alignContent: 'space-between',
    marginBottom: 15,
  },
  imageIcon: {
    width: 22,
    height: 22,
  },
  headerIcon: {
    flex: 4
  },
  notificationBell: {
    flex: 0
  },
  flagIcon: {
    flex: .6
  },
  boldText: {
      fontWeight: 'bold',
  },
  nameText: {
      fontSize: 25, 
      color: '#F0F3F4'
  },
  titleText: {
    color: '#F0F3F4'
  },
  languageSummaryWrapper: {
      flexDirection: 'row', 
      justifyContent: 'space-between'
  },

  yourLanguages: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dailyGoalText: {
      fontSize: 18, 
      fontWeight: 'bold', 
      //color: Colors.light.textPrimary, 
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
      fontWeight: 'bold', 
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
      //color: Colors.light.textSecondary,
      //fontSize: Fonts.size.bodyCopy,
      marginBottom: 20,
  },
  modelContent: {
    //backgroundColor: Colors.light.drab,
    padding: 22,
    borderTopRightRadius: 17,
    borderTopLeftRadius: 17,
  },
  modelContentTitle: {
    fontSize: 20,
    //color: Colors.light.textTertiary,
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
      //borderColor: Colors.light.borders,
      //backgroundColor: Colors.light.ice,
      padding: 20,
      marginBottom: 10
  },
  countryName: {
      //fontSize: Fonts.size.btnLabel
  },

    title: {
      fontSize: 24,
      //fontWeight: Fonts.weight.bold,
      textAlign: 'center',
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    subTitle: {
      fontSize: 14,
      marginBottom: 10,
    },
    languagesOverview: {
      //backgroundColor: Colors.light.background,
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 15,
      marginBottom: 20,
    },
    languageName: {
      //fontWeight: Fonts.weight.bold,
      marginBottom: 5,
    },
    cardContainer: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    cardContainerAlt: {
      backgroundColor: 'white',
      borderRadius: 10,
      marginBottom: 20,
    },
    activityItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    startButton: {
      backgroundColor: '#D97D54',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      marginHorizontal: 5,
      width: 50,
      height: 50,
      position: 'absolute',
      bottom: 10,
      right: 30,
    },

    dashboardCard: {
      marginBottom: 15,
      elevation: 2,
      borderColor: Colors.light.borders,
      borderWidth: 1,
      backgroundColor: Colors.light.background,
      padding: 0,
      margin: 0,
    },

    chartCard: {
      marginBottom: 15,
      elevation: 2,
      borderColor: Colors.light.borders,
      borderWidth: 1,
      backgroundColor: Colors.light.background,
      padding: 0,
      margin: 0,
    },
    progressCard: {
      marginBottom: 15,
      elevation: 2,
    },
    skillProgress: {
      marginBottom: 10,
    },
    progressBar: {
      height: 10,
      borderRadius: 5,
    },
  });

export default DashboardScreen;