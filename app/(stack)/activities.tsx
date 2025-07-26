import { router } from 'expo-router';

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface TimeEntry {
  id: string;
  activity_date: string;
  duration_seconds: number;
  notes: string | null;
  activities: {
    name: string;
  } | null;
  languages: {
    name: string;
  } | null;
}

function formatDate(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default function ActivitiesListScreen() {
  const { profile } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeEntries();
  }, [profile?.id]);

  async function fetchTimeEntries() {
    if (!profile?.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          activity_date,
          duration_seconds,
          notes,
          activities(name),
          languages(name)
        `)
        .eq('user_id', profile.id)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      
      setTimeEntries((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(entryId: string) {
    Alert.alert('Delete Activity', 'Are you sure you want to delete this tracked activity?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setDeletingId(entryId);
          try {
            const { error } = await supabase
              .from('time_entries')
              .delete()
              .eq('id', entryId);
            
            if (error) throw error;

            await fetchTimeEntries();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete activity. Please try again.');
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  }

  function handleEdit(entryId: string) {

    // navigate to edit screen (you'll need to create this)
    router.push(`/(stack)/edit-activity/${entryId}`);
  }

  function handleCreate() {
    router.push('/(tabs)/track');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.rust} />
      </View>
    );
  }

  if (!timeEntries.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          You have no tracked activities. <Text style={styles.link} onPress={handleCreate}>Track one</Text>.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {timeEntries.map(entry => (
        <View key={entry.id} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityDate}>{formatDate(entry.activity_date)}</Text>
            <Text style={styles.activityDuration}>
              {formatDuration(entry.duration_seconds)}
            </Text>
          </View>
          
          <View style={styles.activityDetails}>
            <Text style={styles.activityMeta}>
              {entry.languages?.name ? `${entry.languages.name} • ` : ''}
              {entry.activities?.name || 'Unknown Activity'}
            </Text>
          </View>
          
          {entry.notes && (
            <Text style={styles.activityNotes}>{entry.notes}</Text>
          )}
          
          <View style={styles.actionsRow}>
            <Pressable style={styles.editButton} onPress={() => handleEdit(entry.id)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
            <Pressable 
              style={styles.deleteButton} 
              onPress={() => handleDelete(entry.id)} 
              disabled={deletingId === entry.id}
            >
              <Text style={styles.deleteButtonText}>
                {deletingId === entry.id ? 'Deleting...' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.generalBG,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  link: {
    color: Colors.light.rust,
    textDecorationLine: 'underline',
  },
  activityCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  activityDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.rust,
  },
  activityDetails: {
    marginBottom: 8,
  },
  activityMeta: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  editButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: Colors.light.rust,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 15,
  },
});