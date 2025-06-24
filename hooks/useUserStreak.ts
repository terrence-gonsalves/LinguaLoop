import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useUserStreak(userId: string) {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      calculateStreak();
    }
  }, [userId]);

  async function calculateStreak() {
    try {
      setIsLoading(true);

      // get all time entries for the user, ordered by date
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('activity_date')
        .eq('user_id', userId)
        .not('activity_date', 'is', null)
        .order('activity_date', { ascending: false });

      if (error) throw error;

      if (!timeEntries || timeEntries.length === 0) {
        setStreak(0);
        return;
      }

      // get unique dates (in case multiple entries on same day)
      const uniqueDates = [...new Set(
        timeEntries.map(entry => 
          new Date(entry.activity_date).toDateString()
        )
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      // calculate consecutive days
      let currentStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      // check if user has activity today or yesterday to start counting
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        let currentDate = uniqueDates[0];
        let expectedDate = new Date(currentDate);

        for (let i = 0; i < uniqueDates.length; i++) {
          const entryDate = new Date(uniqueDates[i]);
          const expectedDateStr = expectedDate.toDateString();

          if (entryDate.toDateString() === expectedDateStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
          } else {

            // if there's a gap, break the streak
            break;
          }
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
      setStreak(0);
    } finally {
      setIsLoading(false);
    }
  }

  return { streak, isLoading, refresh: calculateStreak };
} 