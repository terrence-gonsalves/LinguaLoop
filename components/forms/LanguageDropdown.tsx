import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../app/providers/theme-provider';

export interface Language {
  id: string;
  name: string;
}

interface LanguageDropdownProps {
  label: string;
  data: Language[];
  value: string | null;
  onChange: (value: string) => void;
  excludeValues?: string[];
}

export function LanguageDropdown({ label, data, value, onChange, excludeValues = [] }: LanguageDropdownProps) {
  const filteredData = data.filter(item => !excludeValues.includes(item.id));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderText}
        selectedTextStyle={styles.selectedText}
        containerStyle={styles.dropdownContainer}
        itemTextStyle={styles.itemText}
        iconStyle={styles.icon}
        data={filteredData}
        maxHeight={300}
        labelField="name"
        valueField="id"
        placeholder="Select language"
        value={value}
        onChange={item => onChange(item.id)}
        renderRightIcon={() => (
          <MaterialIcons 
            name="arrow-drop-down" 
            size={24} 
            color={Colors.light.textSecondary} 
          />
        )}
      />
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
  dropdown: {
    height: 44,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  itemText: {
    fontSize: 16,
    color: Colors.light.text,
    padding: 8,
  },
}); 