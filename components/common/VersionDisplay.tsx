import { Colors } from '@/constants/Colors';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

interface VersionDisplayProps {
  showBuildNumber?: boolean;
}

export function VersionDisplay({ showBuildNumber = false }: VersionDisplayProps) {
  const version = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = {
    ios: Constants.expoConfig?.ios?.buildNumber,
    android: Constants.expoConfig?.android?.versionCode?.toString(),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.versionText}>
        v{version}
        {showBuildNumber && (buildNumber.ios || buildNumber.android) && 
          ` (${buildNumber.ios || buildNumber.android})`
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
}); 