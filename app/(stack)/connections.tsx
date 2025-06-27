import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConnectionCard from '@/components/ConnectionCard';
import { useActiveConnections } from '@/hooks/useActiveConnections';
import { useAuth } from '@/lib/auth-context';
import { Colors } from '@/providers/theme-provider';

export default function ConnectionsScreen() {
  const { profile } = useAuth();
  const { connections, isLoading, error } = useActiveConnections(profile?.id || '');

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      );
    }

    if (error) {
      return <Text style={styles.errorText}>Error loading connections: {error}</Text>;
    }

    if (connections.length === 0) {
      return <Text style={styles.noDataText}>No active connections yet</Text>;
    }

    return connections.map((connection) => (
      <ConnectionCard
        key={connection.id}
        name={connection.name || ''}
        username={connection.user_name || ''}
        nativeLanguage={connection.native_language || 'Unknown'}
        avatarUrl={connection.avatar_url || undefined}
        aboutMe={connection.about_me || ''}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Active Connections</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    padding: 16,
  },
  noDataText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
}); 