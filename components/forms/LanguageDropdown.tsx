import Colors from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export type Language = {
  id: string;
  name: string;
};

interface LanguageDropdownProps {
  label: string;
  data: Language[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  excludeValues?: string[];
}

export function LanguageDropdown({ 
  label, 
  data, 
  value, 
  onChange, 
  disabled = false,
  excludeValues = []
}: LanguageDropdownProps) {
  const filteredData = data.filter(item => !excludeValues.includes(item.id));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={filteredData}
        maxHeight={300}
        labelField="name"
        valueField="id"
        placeholder={`Select ${label.toLowerCase()}`}
        value={value}
        onChange={item => onChange(item.id)}
        disable={disabled}
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
    color: Colors.light.textPrimary,
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    backgroundColor: Colors.light.formInputBG,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.formInputBorder,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
}); 