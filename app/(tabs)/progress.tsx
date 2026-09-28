import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  StyleSheet 
} from 'react-native';
import { 
  SegmentedButtons, 
  Card, 
  ProgressBar 
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

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

const ProgressScreen: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Spanish');

  // Typed mock data for languages and progress
  const languages: string[] = ['Spanish', 'French', 'Japanese'];
  
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
    Japanese: {
      weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [35, 45, 25, 40, 50, 45, 30]
        }]
      },
      monthly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [140, 170, 150, 160]
        }]
      }
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Language Learning Progress</Text>

      {/* Language Selector */}
      <SegmentedButtons
        value={selectedLanguage}
        onValueChange={setSelectedLanguage}
        buttons={languages.map(lang => ({
          value: lang,
          label: lang
        }))}
        style={styles.languageSelector}
      />

      {/* Time Filter */}
      <SegmentedButtons
        value={timeFilter}
        onValueChange={setTimeFilter}
        buttons={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ]}
        style={styles.timeFilterSelector}
      />

      {/* Time Spent Chart */}
      <Card style={styles.chartCard}>
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
      <Card style={styles.progressCard}>
        <Card.Title title="Skill Progress" />
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

      {/* Achievement Summary */}
      <Card style={styles.achievementCard}>
        <Card.Title title="Achievements" />
        <Card.Content>
          <View style={styles.achievementRow}>
            <Text>Total Learning Time</Text>
            <Text>120 hours</Text>
          </View>
          <View style={styles.achievementRow}>
            <Text>Longest Streak</Text>
            <Text>45 days</Text>
          </View>
          <View style={styles.achievementRow}>
            <Text>Languages Learned</Text>
            <Text>3</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  languageSelector: {
    marginBottom: 15,
  },
  timeFilterSelector: {
    marginBottom: 15,
  },
  chartCard: {
    marginBottom: 15,
    elevation: 2,
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
  achievementCard: {
    elevation: 2,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  }
});

export default ProgressScreen;