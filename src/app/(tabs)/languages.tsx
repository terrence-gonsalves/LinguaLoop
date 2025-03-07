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

export default function LanguageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Languages</Text>
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
