import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { H1, H2, H3, H4, H5, H6, YStack, Button, XGroup, XStack, } from 'tamagui';

export default function Dashboard() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isInvalid, setIsInvalid] = useState(false)
  const [inputValue, setInputValue] = useState("12345");

  const handleSubmit = () => {
    if (inputValue.length < 6) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' }
  ];

    return (
      <View>
        <YStack alignSelf="center">
          <H1>Heading 1</H1>
          <H2>Heading 2</H2>
          <H3>Heading 3</H3>
          <H4>Heading 4</H4>
          <H5>Heading 5</H5>
          <H6>Heading 6</H6>
        </YStack>

        <YStack padding="$3" gap="$3">
          <Button>Plain</Button>
          <XStack gap="$2" justifyContent="center">
            <Button size="$3" theme="active">
              Active
            </Button>
            <Button size="$3" variant="outlined">
              Outlined
            </Button>
          </XStack>
          <XStack gap="$2">
            <Button themeInverse size="$3">
              Inverse
            </Button>
          </XStack>
          <XGroup>
            <XGroup.Item>
              <Button width="50%" size="$2" disabled opacity={0.5}>
                disabled
              </Button>
            </XGroup.Item>

            <XGroup.Item>
              <Button width="50%" size="$2" chromeless>
                chromeless
              </Button>
            </XGroup.Item>
          </XGroup>
        </YStack>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
  });