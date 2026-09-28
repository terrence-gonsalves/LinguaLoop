import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabaseConfig';
import { Picker } from '@react-native-picker/picker';

const LanguageManagementScreen = () => {
  const router = useRouter();
  const [userLanguages, setUserLanguages] = useState([]);
  const [masterLanguages, setMasterLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [addingLanguage, setAddingLanguage] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Authentication Error', 'User not authenticated. Please log in again.');
        router.replace('/(auth)/login');
        return;
      }

      const userId = user.id;

      // fetch master languages
      const { data: masterData, error: masterError } = await supabase
        .from('master_languages')
        .select('id, name')
        .order('name', { ascending: true }); // order alphabetically

      if (masterError) {
        console.error("Error fetching master languages:", masterError);
        Alert.alert('Error', 'Failed to load master languages: ' + masterError.message);
        return;
      }
      setMasterLanguages(masterData);

      // set initial selected language to the first one in the master list if available
      if (masterData.length > 0) {
        setSelectedLanguageId(masterData[0].id);
      }

      // fetch user's currently tracked languages
      const { data: userData, error: userLangError } = await supabase
        .from('languages')
        .select('id, name, master_language_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userLangError) {
        console.error("Error fetching user languages:", userLangError);
        Alert.alert('Error', 'Failed to load your languages: ' + userLangError.message);
      } else {
        setUserLanguages(userData);
      }
    } catch (error) {
      console.error("Unexpected error fetching data:", error);
      Alert.alert('Error', 'An unexpected error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSelectedLanguage = async () => {
    if (!selectedLanguageId) {
      Alert.alert('Selection Error', 'Please select a language to add.');
      return;
    }

    const isAlreadyTracking = userLanguages.some(
      (lang) => lang.master_language_id === selectedLanguageId
    );
    if (isAlreadyTracking) {
      Alert.alert('Duplicate Language', 'You are already tracking this language.');
      return;
    }

    setAddingLanguage(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Authentication Error', 'User not authenticated. Please log in again.');
        router.replace('/(auth)/login');
        setAddingLanguage(false);
        return;
      }

      // get the name of the selected language from the master list
      const languageToAdd = masterLanguages.find(lang => lang.id === selectedLanguageId);
      if (!languageToAdd) {
        Alert.alert('Error', 'Selected language not found in master list.');
        setAddingLanguage(false);
        return;
      }

      // insert the new language
      const { data, error } = await supabase
        .from('languages')
        .insert({
          user_id: user.id,
          name: languageToAdd.name, 
          master_language_id: selectedLanguageId,
        })
        .select();

      if (error) {
        console.error("Error adding language:", error);
        Alert.alert('Error', 'Failed to add language: ' + error.message);
      } else if (data && data.length > 0) {
        setUserLanguages(prevLanguages => [data[0], ...prevLanguages]);
        Alert.alert('Success', `${languageToAdd.name} added successfully!`);
      }
    } catch (error) {
      console.error("Unexpected error adding language:", error);
      Alert.alert('Error', 'An unexpected error occurred while adding the language.');
    } finally {
      setAddingLanguage(false);
    }
  };

  const handleDeleteLanguage = async (id, name) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to stop tracking "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Tracking',
          onPress: async () => {
            setLoading(true); 
            try {
              const { error } = await supabase
                .from('languages')
                .delete()
                .eq('id', id);

              if (error) {
                console.error("Error deleting language:", error);
                Alert.alert('Error', 'Failed to stop tracking language: ' + error.message);
              } else {
                setUserLanguages(prevLanguages => prevLanguages.filter(lang => lang.id !== id));
                Alert.alert('Success', `${name} removed from your tracked list.`);
              }
            } catch (error) {
              console.error("Unexpected error deleting language:", error);
              Alert.alert('Error', 'An unexpected error occurred while removing the language.');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderUserLanguageItem = ({ item }) => (
    <View style={styles.languageItem}>
      <Text style={styles.languageText}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleDeleteLanguage(item.id, item.name)}
        style={styles.deleteButton}
        disabled={loading}
      >
        <Text style={styles.deleteButtonText}>Stop Tracking</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading languages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Your Languages</Text>

      <Text style={styles.sectionTitle}>Add a new language to track:</Text>
      <View style={styles.addLanguageContainer}>
        {masterLanguages.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLanguageId}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedLanguageId(itemValue)
              }
              style={styles.picker}
              enabled={!addingLanguage}
            >
              {masterLanguages.map((lang) => (
                <Picker.Item key={lang.id} label={lang.name} value={lang.id} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text>No master languages available. Please add some in Supabase.</Text>
        )}
        <Button
          title={addingLanguage ? "Adding..." : "Add Selected Language"}
          onPress={handleAddSelectedLanguage}
          disabled={addingLanguage || !selectedLanguageId}
        />
      </View>

      <Text style={styles.sectionTitle}>Languages you are tracking:</Text>
      {userLanguages.length === 0 ? (
        <Text style={styles.noLanguagesText}>You are not tracking any languages yet. Add one above!</Text>
      ) : (
        <FlatList
          data={userLanguages}
          keyExtractor={(item) => item.id}
          renderItem={renderUserLanguageItem}
          contentContainerStyle={styles.listContentContainer}
          style={styles.list}
        />
      )}

      <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
    </View>
  );
};

// EXPORT OPTIONS HERE FOR THIS SCREEN
export const options = {
  title: 'Manage Languages', // Set the header title for the Language Management screen
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
    color: '#333',
  },
  addLanguageContainer: {
    flexDirection: 'column', 
    marginBottom: 20,
    alignItems: 'stretch', 
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    overflow: 'hidden', 
  },
  picker: {
    height: 50,
    width: '100%',
  },
  noLanguagesText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
    width: '100%',
    marginTop: 10,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  languageText: {
    fontSize: 18,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12, 
  },
  backButton: {
    marginTop: 20,
  },
});

export default LanguageManagementScreen;
