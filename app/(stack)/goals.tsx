import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';

import { useAuth } from '@/lib/auth-context';
import { cancelGoalNotification } from '@/lib/goal-notifications';
import {
  canMarkCompleted,
  fetchTimeGoalProgress,
  getGoalDisplayStatus,
  markGoalCompleted,
  parseDateOnly,
  type Goal,
  type GoalDisplayStatus,
  type TimeGoalProgress,
} from '@/lib/goals';
import { supabase } from '@/lib/supabase';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

type GoalWithLanguage = Goal & { languages: { name: string } | null };

function formatDate(dateString: string) {
  if (!dateString) return '';

  // parse as a local calendar day so the date doesn't shift a day west of UTC
  const date = parseDateOnly(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function getGoalTypeLabel(type: string) {
  switch (type) {
    case 'daily_time':
      return 'Daily Time';
    case 'weekly_time':
      return 'Weekly Time';
    case 'monthly_vocab':
      return 'Monthly Vocab';
    case 'lessons_completed':
      return 'Lessons Completed';
    case 'skill_level':
      return 'Skill Level';
    case 'custom':
      return 'Custom';
    default:
      return type;
  }
}

function getStatusStyle(status: GoalDisplayStatus) {
  switch (status) {
    case 'Completed':
      return styles.statusCompleted;
    case 'Missed':
      return styles.statusMissed;
    case 'In progress':
      return styles.statusInProgress;
    case 'Ended':
      return styles.statusEnded;
    default:
      return styles.statusNotStarted;
  }
}

export default function GoalsListScreen() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<GoalWithLanguage[]>([]);
  const [progressByGoal, setProgressByGoal] = useState<Record<string, TimeGoalProgress>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!profile?.id) return;

    // fetch goals and join language name
    const { data, error } = await supabase
      .from('goals')
      .select('*, languages(name)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      showErrorToast('Failed to load goals');
      setLoading(false);
      return;
    }

    const loadedGoals = (data || []) as GoalWithLanguage[];
    setGoals(loadedGoals);
    setLoading(false);

    // logged time for daily and weekly time goals that are in progress
    const progressEntries = await Promise.all(
      loadedGoals.map(async (goal) => {
        try {
          const progress = await fetchTimeGoalProgress(goal);
          return progress ? { goalId: goal.id, progress } : null;
        } catch (err) {
          console.error('Error loading goal progress:', err);
          return null;
        }
      })
    );

    const nextProgress: Record<string, TimeGoalProgress> = {};
    for (const entry of progressEntries) {
      if (entry) nextProgress[entry.goalId] = entry.progress;
    }
    setProgressByGoal(nextProgress);
  }, [profile?.id]);

  // refetch whenever the screen comes back into focus, e.g. after creating or editing a goal
  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [fetchGoals])
  );

  async function handleDelete(goalId: string) {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(goalId);

          const { data, error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .select('id');

          setDeletingId(null);

          if (error || !data || data.length === 0) {
            showErrorToast('Failed to delete goal. Please try again.');
            return;
          }

          await cancelGoalNotification(goalId);
          fetchGoals();
        },
      },
    ]);
  }

  async function handleMarkCompleted(goalId: string) {
    setCompletingId(goalId);

    try {
      await markGoalCompleted(goalId);
      await cancelGoalNotification(goalId);
      showSuccessToast('Goal completed');
      fetchGoals();
    } catch (error) {
      console.error('Error completing goal:', error);
      showErrorToast('Failed to update goal. Please try again.');
    } finally {
      setCompletingId(null);
    }
  }

  function handleEdit(goalId: string) {
    router.push(`/goals/${goalId}/edit`);
  }

  function handleCreate() {
    router.push('/(stack)/create-goal');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.rust} />
      </View>
    );
  }

  if (!goals.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          You have no goals.{' '}
          <Text style={styles.link} onPress={handleCreate}>
            Create one
          </Text>
          .
        </Text>
      </View>
    );
  }

  const renderGoalItem = ({ item: goal }: { item: GoalWithLanguage }) => {
    const displayStatus = getGoalDisplayStatus(goal);
    const progress = progressByGoal[goal.id];

    let targetText: string | null = null;

    if (progress) {
      targetText = `${progress.minutes} of ${progress.targetMinutes} min ${progress.period}`;
    } else if (goal.target_value_numeric) {
      const unit =
        goal.goal_type === 'daily_time' || goal.goal_type === 'weekly_time' ? ' min' : '';
      targetText = `Target: ${goal.target_value_numeric}${unit}`;
    } else if (goal.target_value_text) {
      targetText = `Target: ${goal.target_value_text}`;
    }

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={[styles.goalStatus, getStatusStyle(displayStatus)]}>{displayStatus}</Text>
        </View>
        <Text style={styles.goalMeta}>
          {goal.languages?.name ? `${goal.languages.name} • ` : ''}
          {getGoalTypeLabel(goal.goal_type)} • {formatDate(goal.start_date)} to{' '}
          {formatDate(goal.end_date)}
        </Text>
        {targetText && <Text style={styles.goalMeta}>{targetText}</Text>}
        {progress && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
          </View>
        )}
        <View style={styles.actionsRow}>
          {canMarkCompleted(goal) && (
            <Pressable
              style={styles.completeButton}
              onPress={() => handleMarkCompleted(goal.id)}
              disabled={completingId === goal.id}
            >
              <Text style={styles.completeButtonText}>
                {completingId === goal.id ? 'Saving...' : 'Mark as completed'}
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.editButton} onPress={() => handleEdit(goal.id)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(goal.id)}
            disabled={deletingId === goal.id}
          >
            <Text style={styles.deleteButtonText}>
              {deletingId === goal.id ? 'Deleting...' : 'Delete'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={goals}
      renderItem={renderGoalItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
    />
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
    gap: 8,
  },
  goalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  goalStatus: {
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusNotStarted: {
    color: Colors.light.textSecondary,
    backgroundColor: Colors.light.generalBG,
  },
  statusInProgress: {
    color: Colors.light.buttonPrimary,
    backgroundColor: Colors.light.generalBG,
  },
  statusCompleted: {
    color: Colors.light.green,
    backgroundColor: Colors.light.green_tint,
  },
  statusEnded: {
    color: Colors.light.rust,
    backgroundColor: Colors.light.generalBG,
  },
  statusMissed: {
    color: Colors.light.error,
    backgroundColor: Colors.light.red_tint,
  },
  goalMeta: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.generalBG,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.rust,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  completeButton: {
    backgroundColor: Colors.light.green,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  completeButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 15,
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
