import { router } from 'expo-router';

import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { Colors } from '@/providers/theme-provider';

export default function ActivitiesListScreen() {
    const { profile } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, [profile?.id]);

    async function fetchActivities() {
        if (!profile?.id) return;

        setLoading(true);
    
        // fetch activities
        

       // if (!error) setGoals(data || []);

        setLoading(false);
    }

    function handleEdit(goalId: string) {
        //router.push(`/goals/${goalId}/edit`);
      }
    
      function handleCreate() {
        router.push('/app/(tab)/track');
      }

    return (
        <ScrollView style={styles.container}>
            {loading && <ActivityIndicator size="large" color={Colors.light.rust} />}

            {activities.length === 0 && <View style={styles.center}><Text style={styles.emptyText}>You have no activities tracked. <Text style={styles.link} onPress={handleCreate}>Create one</Text>.</Text></View>}
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
});