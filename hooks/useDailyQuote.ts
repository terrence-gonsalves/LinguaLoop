import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const QUOTE_STORAGE_KEY = '@daily_quote';
const QUOTE_TIMESTAMP_KEY = '@daily_quote_timestamp';
const DEFAULT_QUOTE = {
  quote: "The limits of my language mean the limits of my world.",
  author: "Ludwig Wittgenstein"
};

interface Quote {
  quote: string;
  author: string;
}

export function useDailyQuote() {
  const [quote, setQuote] = useState<Quote>(DEFAULT_QUOTE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRandomQuote() {
    try {
      
      // get a random quote from the database
      const { data, error: fetchError } = await supabase
        .from('quotes')
        .select('quote, author')
        .limit(1)
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        
        // if there's an error, use the default quote
        setQuote(DEFAULT_QUOTE);
        setError(null);
        
        return;
      }

      if (!data) {
        setQuote(DEFAULT_QUOTE);
        setError(null);

        return;
      }
      
      const newQuote = {
        quote: data.quote,
        author: data.author
      };

      // store the quote and timestamp
      await AsyncStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(newQuote));
      await AsyncStorage.setItem(QUOTE_TIMESTAMP_KEY, new Date().toISOString());

      setQuote(newQuote);
      setError(null);
    } catch (err) {
      console.error('Error in fetchRandomQuote:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      setQuote(DEFAULT_QUOTE);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkAndUpdateQuote() {
    try {
      const storedQuote = await AsyncStorage.getItem(QUOTE_STORAGE_KEY);
      const storedTimestamp = await AsyncStorage.getItem(QUOTE_TIMESTAMP_KEY);

      if (!storedQuote || !storedTimestamp) {

        // no stored quote, fetch a new one
        await fetchRandomQuote();
        return;
      }

      const lastUpdate = new Date(storedTimestamp);
      const now = new Date();
      const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastUpdate >= 24) {

        // quote is older than 24 hours, fetch a new one
        await fetchRandomQuote();
      } else {

        // use stored quote
        setQuote(JSON.parse(storedQuote));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error checking quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to check quote');
      setQuote(DEFAULT_QUOTE);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAndUpdateQuote();
  }, []);

  return { quote, isLoading, error };
} 