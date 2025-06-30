import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';


function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function getGoalTypeLabel(type: string) {
  switch (type) {
    case 'daily_time': return 'Daily Time';
    case 'weekly_time': return 'Weekly Time';
    case 'monthly_vocab': return 'Monthly Vocab';
    case 'lessons_completed': return 'Lessons Completed';
    case 'skill_level': return 'Skill Level';
    case 'custom': return 'Custom';
    default: return type;
  }
}

export default function GoalsListScreen() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [profile?.id]);

  async function fetchGoals() {
    if (!profile?.id) return;
    setLoading(true);

    // fetch goals and join language name
    const { data, error } = await supabase
      .from('goals')
      .select('*, languages(name)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (!error) setGoals(data || []);
    setLoading(false);
  }

  async function handleDelete(goalId: string) {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeletingId(goalId);
          await supabase.from('goals').delete().eq('id', goalId);
          setDeletingId(null);
          fetchGoals();
        }
      }
    ]);
  }

  function handleEdit(goalId: string) {
    router.push(`/goals/${goalId}/edit`);
  }

  function handleCreate() {
    router.push('/(stack)/create-goal');
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.light.rust} /></View>;
  }

  if (!goals.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no goals. <Text style={styles.link} onPress={handleCreate}>Create one</Text>.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {goals.map(goal => {

        // calculate minutes remaining if applicable
        let minutesRemaining = null;
        if (goal.target_value_numeric && ['daily_time', 'weekly_time'].includes(goal.goal_type)) {

          // fetch time_entries for this goal (not implemented here, could be added with a hook or effect)
          // for now, just show the target value
          minutesRemaining = `${goal.target_value_numeric} min remaining`;
        } else if (goal.target_value_numeric) {
          minutesRemaining = `${goal.target_value_numeric}`;
        }
        return (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalStatus}>{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}</Text>
            </View>
            <Text style={styles.goalMeta}>
              {goal.languages?.name ? `${goal.languages.name} • ` : ''}
              {getGoalTypeLabel(goal.goal_type)} • {formatDate(goal.end_date)}
            </Text>
            {minutesRemaining && <Text style={styles.goalMeta}>{minutesRemaining}</Text>}
            <View style={styles.actionsRow}>
              <Pressable style={styles.editButton} onPress={() => handleEdit(goal.id)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(goal.id)} disabled={deletingId === goal.id}>
                <Text style={styles.deleteButtonText}>{deletingId === goal.id ? 'Deleting...' : 'Delete'}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
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
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  goalStatus: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  goalMeta: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
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