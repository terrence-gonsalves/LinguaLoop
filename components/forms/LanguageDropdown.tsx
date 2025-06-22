import { LanguageFlag } from '@/components/LanguageFlag';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

export interface Language {
  id: string;
  name: string;
  flag?: string | null;
}

interface LanguageDropdownProps {
  label: string;
  data: Language[];
  value: string | null;
  onChange: (value: string | null) => void;
  excludeValues?: string[];
  style?: ViewStyle;
  dropdownStyle?: ViewStyle;
  showAllLanguagesOption?: boolean;
  displayMode?: 'default' | 'flagOnly';
}

const { height: screenHeight } = Dimensions.get('window');

export function LanguageDropdown({ 
  label, 
  data, 
  value, 
  onChange, 
  excludeValues = [], 
  style,
  dropdownStyle,
  showAllLanguagesOption = false,
  displayMode = 'default',
}: LanguageDropdownProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // filter out excluded values
  const filteredData = data.filter(item => !excludeValues.includes(item.id));
  
  // get the selected language object
  const selectedLanguage = data.find(item => item.id === value) || null;

  // filter data based on search query
  const searchFilteredData = filteredData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = useCallback(() => {
    setIsModalVisible(true);
    setSearchQuery('');
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleCloseModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setSearchQuery('');
    });
  }, [slideAnim]);

  const handleSelectLanguage = useCallback((languageId: string | null) => {
    onChange(languageId);
    handleCloseModal();
  }, [onChange, handleCloseModal]);

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable
        style={[
          displayMode === 'flagOnly' ? styles.flagOnlyField : styles.dropdownField,
          dropdownStyle
        ]}
        onPress={handleOpenModal}
      >
        {displayMode === 'flagOnly' ? (
          <View style={styles.flagOnlyContainer}>
            {selectedLanguage ? (
              <LanguageFlag
                name={selectedLanguage.name}
                flagUrl={selectedLanguage.flag || null}
                size={28}
              />
            ) : (
              <MaterialCommunityIcons name="earth" size={28} color={Colors.light.textSecondary} />
            )}
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={Colors.light.textSecondary}
            />
          </View>
        ) : (
          <>
            {selectedLanguage ? (
              <View style={styles.selectedLanguageContainer}>
                <LanguageFlag
                  name={selectedLanguage.name}
                  flagUrl={selectedLanguage.flag || null}
                />
                <Text style={styles.selectedLanguageText}>
                  {selectedLanguage.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select language</Text>
            )}
            
            <View style={styles.fieldActions}>
              {value && (
                <Pressable
                  style={styles.clearButton}
                  onPress={handleClear}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="clear"
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </Pressable>
              )}
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={Colors.light.textSecondary}
              />
            </View>
          </>
        )}
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight, 0],
                  }),
                }],
              },
            ]}
          >
            <Pressable style={styles.modalInner} onPress={() => {}}>

              {/* header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={Colors.light.textSecondary}
                  />
                </Pressable>
              </View>

              {/* search bar */}
              <View style={styles.searchContainer}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color={Colors.light.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search languages..."
                  placeholderTextColor={Colors.light.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={false}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>

              {/* language list */}
              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {showAllLanguagesOption && (
                  <Pressable
                    style={[
                      styles.languageItem,
                      value === null && styles.languageItemSelected,
                    ]}
                    onPress={() => handleSelectLanguage(null)}
                  >
                    <View style={styles.languageInfo}>
                      <View style={styles.allLanguagesFlag}>
                        <MaterialCommunityIcons
                          name="earth"
                          size={20}
                          color={Colors.light.rust}
                        />
                      </View>
                      <Text style={[
                        styles.languageName,
                        value === null && styles.languageNameSelected,
                      ]}>
                        All Languages
                      </Text>
                    </View>
                    {value === null && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={Colors.light.rust}
                      />
                    )}
                  </Pressable>
                )}

                {searchFilteredData.map((language) => (
                  <Pressable
                    key={language.id}
                    style={[
                      styles.languageItem,
                      value === language.id && styles.languageItemSelected,
                    ]}
                    onPress={() => handleSelectLanguage(language.id)}
                  >
                    <View style={styles.languageInfo}>
                      <LanguageFlag
                        name={language.name}
                        flagUrl={language.flag || null}
                      />
                      <Text style={[
                        styles.languageName,
                        value === language.id && styles.languageNameSelected,
                      ]}>
                        {language.name}
                      </Text>
                    </View>
                    {value === language.id && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={Colors.light.rust}
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 50,
  },
  flagOnlyField: {
    padding: 4,
  },
  flagOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedLanguageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguageText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    marginLeft: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  fieldActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.6,
    maxHeight: 500,
  },
  modalInner: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: Colors.light.generalBG,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textPrimary,
    paddingVertical: 12,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageItemSelected: {
    backgroundColor: Colors.light.generalBG,
  },
  languageInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allLanguagesFlag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.generalBG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  languageName: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    marginLeft: 12,
  },
  languageNameSelected: {
    color: Colors.light.rust,
    fontWeight: '500',
  },
}); 