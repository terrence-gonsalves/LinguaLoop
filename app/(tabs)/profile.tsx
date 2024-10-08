import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/Avatar';
import { DividerLine } from '@/components/DividerLine';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.wrapper}>
      <ThemedView darkColor={'transparent'} style={ styles.container }>
        <ThemedView darkColor={'transparent'} style={ styles.profileInfoContainer }>
          <ThemedView darkColor={'transparent'}>
            <Text style={ styles.profileTitles }>Name</Text>
            <Text style={ styles.profileInfoJoined }>Joined: July 24, 2024</Text>
            <ThemedView style={ styles.profileFlagsContainer }></ThemedView>
          </ThemedView>

          <Avatar width={125} />
        </ThemedView>

        <DividerLine />

        <ThemedView darkColor={'transparent'} style={ styles.profileStatsContainer }>
          <Text style={ styles.profileTitles }>Statistics</Text>

          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingRight: 3 }}
            pagingEnabled={true}>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>Spanish</Text>
              </ThemedView>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>French</Text>
              </ThemedView>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>Italian</Text>
              </ThemedView>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>Portuguese</Text>
              </ThemedView>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>Tagalog</Text>
              </ThemedView>
              <ThemedView darkColor={'transparent'} style={styles.languageSelector}>
                <Text style={styles.languageText}>English</Text>
              </ThemedView>
          </ScrollView>

          <ThemedView darkColor={'transparent'} style={ styles.profileStatsWrapper }>          
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>
              <MaterialCommunityIcons name="trophy-award" size={30} />
              <Text>Top Language</Text>
              <Text>Spanish</Text>
            </ThemedView>
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>          
              <MaterialCommunityIcons name="desktop-mac-dashboard" size={30} />
              <Text>Total Input Hours</Text>
              <Text>135</Text>
            </ThemedView>
          </ThemedView>

          <ThemedView darkColor={'transparent'} style={ styles.profileStatsWrapper }>
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>
              <MaterialCommunityIcons name="calendar" size={30} />
              <Text>40</Text>
              <Text>Days Practiced</Text>
            </ThemedView>
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>          
              <MaterialCommunityIcons name="calendar" size={30} />
              <Text>12</Text>
              <Text>Day Streak</Text>
            </ThemedView>
          </ThemedView>   

          <ThemedView darkColor={'transparent'} style={ styles.profileStatsWrapper }> 
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>  
              <MaterialCommunityIcons name="clock" size={30} />
              <Text>125</Text>        
              <Text>Total Hours Spanish</Text>
            </ThemedView>
            <ThemedView darkColor={'transparent'} style={ styles.profileStats }>
              <MaterialCommunityIcons name="clock" size={30} />
              <Text>10</Text>        
              <Text>Total Hours French</Text>
            </ThemedView>
          </ThemedView> 
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
      flex: 1,
  },
  container: {
      padding: 15,
  },
  profileInfoContainer: {
      flexDirection: 'row',  
      justifyContent: 'space-between', 
      alignItems: 'center'
  },
  profileTitles: {
      fontWeight: 'bold', 
      fontSize: 24,
  },
  profileInfoJoined: { 
      paddingTop: 5,
      paddingBottom: 5
  },
  profileFlagsContainer: {
      flexDirection: 'row', 
      alignItems: 'center'
  },
  profileFlags: {
      width: 30, 
      aspectRatio: 1,
      marginRight: 5
  },
  profileStatsContainer: {
      paddingRight: 10,
      paddingLeft: 10,
      paddingBottom: 10,
  },
  profileStatsWrapper: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginVertical: 10,
  },
  profileStats: {
      width: '49%', 
      alignItems: 'center', 
      backgroundColor: Colors.light.generalBG, 
      borderWidth: 1, 
      borderColor: Colors.light.generalBG, 
      borderRadius: 10, 
      padding: 20
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
  languageSelector: {
    backgroundColor: Colors.light.tabsBG,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginVertical: 10,
    width: 150,
    height: 60,
    borderRightWidth: 1,
    borderRightColor: Colors.light.background,
  },
  languageText: {
    color: Colors.light.text,
    fontSize: 16,
    textAlign: 'center',
    width: 150,
  }
});