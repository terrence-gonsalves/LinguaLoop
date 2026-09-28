import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity 
} from 'react-native';
import { 
  Card, 
  FAB, 
  Modal, 
  Portal, 
  TextInput, 
  Button 
} from 'react-native-paper';

// Type definitions
interface Language {
  id: string;
  name: string;
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  totalHours: number;
  lastStudied: Date;
}

const LanguagesScreen: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([
    {
      id: '1',
      name: 'Spanish',
      learningLevel: 'Intermediate',
      totalHours: 42,
      lastStudied: new Date()
    },
    {
      id: '2',
      name: 'French',
      learningLevel: 'Beginner',
      totalHours: 15,
      lastStudied: new Date()
    },
    {
      id: '3',
      name: 'Japanese',
      learningLevel: 'Advanced',
      totalHours: 85,
      lastStudied: new Date()
    }
  ]);

  const [isAddModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newLanguage, setNewLanguage] = useState<Partial<Language>>({});

  const addLanguage = () => {
    if (newLanguage.name) {
      const language: Language = {
        id: (languages.length + 1).toString(),
        name: newLanguage.name,
        learningLevel: newLanguage.learningLevel || 'Beginner',
        totalHours: 0,
        lastStudied: new Date()
      };
      setLanguages([...languages, language]);
      setAddModalVisible(false);
      setNewLanguage({});
    }
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <Card style={styles.languageCard}>
      <Card.Content>
        <View style={styles.languageCardContent}>
          <View>
            <Text style={styles.languageName}>{item.name}</Text>
            <Text>Level: {item.learningLevel}</Text>
            <Text>Total Hours: {item.totalHours}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.detailsButton}>Details</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Languages</Text>

      <FlatList
        data={languages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>No languages added yet</Text>
          </View>
        }
      />

      <Portal>
        <Modal 
          visible={isAddModalVisible} 
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Add New Language</Text>
          <TextInput
            label="Language Name"
            value={newLanguage.name || ''}
            onChangeText={(text) => setNewLanguage({...newLanguage, name: text})}
            style={styles.input}
          />
          <View style={styles.levelSelector}>
            <Text>Learning Level:</Text>
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
              <Button
                key={level}
                mode={newLanguage.learningLevel === level ? 'contained' : 'outlined'}
                onPress={() => setNewLanguage({...newLanguage, learningLevel: level})}
                style={styles.levelButton}
              >
                {level}
              </Button>
            ))}
          </View>
          <Button 
            mode="contained" 
            onPress={addLanguage}
            disabled={!newLanguage.name}
            style={styles.addButton}
          >
            Add Language
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  languageCard: {
    marginBottom: 10,
    elevation: 2,
  },
  languageCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsButton: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  levelSelector: {
    marginBottom: 15,
  },
  levelButton: {
    marginTop: 10,
  },
  addButton: {
    marginTop: 15,
  }
});

export default LanguagesScreen;