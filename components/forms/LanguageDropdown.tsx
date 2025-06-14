import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
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
  style?: ViewStyle;
  dropdownStyle?: ViewStyle;
}

export function LanguageDropdown({ 
  label, 
  data, 
  value, 
  onChange, 
  excludeValues = [], 
  style,
  dropdownStyle,
}: LanguageDropdownProps) {
  const filteredData = data.filter(item => !excludeValues.includes(item.id));

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Dropdown
        style={[styles.dropdown, dropdownStyle]}
        placeholderStyle={[styles.placeholderText, { color: Colors.light.textPrimary }]}
        selectedTextStyle={[styles.selectedText, { color: Colors.light.textPrimary }]}
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
    height: 56,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 24,
    height: 24,
  },
  placeholderText: {
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
  },
  itemText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    padding: 8,
  },
}); 