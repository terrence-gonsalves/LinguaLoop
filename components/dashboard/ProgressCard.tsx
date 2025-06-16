import { StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Colors } from '../../app/providers/theme-provider';

interface ActivityData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface ProgressCardProps {
  activityData: ActivityData[];
  weeklyLabels: string[];
  weeklyValues: number[];
  chartConfig: any;
}

export function ProgressCard({ activityData, weeklyLabels, weeklyValues, chartConfig }: ProgressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Activity Distribution</Text>
        <PieChart
          data={activityData}
          width={300}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <BarChart
          data={{
            labels: weeklyLabels,
            datasets: [
              {
                data: weeklyValues,
              },
            ],
          }}
          width={300}
          height={200}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 12,
  },
}); 