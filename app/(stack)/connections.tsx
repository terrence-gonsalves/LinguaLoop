import { Stack } from 'expo-router/stack';

import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConnectionCard from '@/components/ConnectionCard';

import { useActiveConnections } from '@/hooks/useActiveConnections';

import { useAuth } from '@/lib/auth-context';

import { Colors } from '@/providers/theme-provider';

export default function ConnectionsScreen() {
  const { profile } = useAuth();
  const { connections, isLoading, error } = useActiveConnections(profile?.id || '', null);

  const renderConnectionItem = ({ item: connection }: { item: any }) => (
    <ConnectionCard
      userId={connection.id}
      name={connection.name || ''}
      username={connection.user_name || ''}
      nativeLanguage={connection.native_language || 'Unknown'}
      avatarUrl={connection.avatar_url || undefined}
      aboutMe={connection.about_me || ''}
    />
  );

  const renderEmptyComponent = () => {
    if (error) {
      return <Text style={styles.errorText}>Error loading connections: {error}</Text>;
    }
    return <Text style={styles.noDataText}>No active connections yet</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Active Connections',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.light.background },
        }} 
      />
      {(isLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.rust} />
        </View>
      ) : (
        <FlatList
          data={connections}
          renderItem={renderConnectionItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyComponent}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
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