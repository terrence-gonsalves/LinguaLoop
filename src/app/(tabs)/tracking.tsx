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

export default function TrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Tracking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
