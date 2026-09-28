import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    Dimensions,
    Pressable, 
    TouchableOpacity
  } from 'react-native';
  import { 
    Card, 
    Surface, 
    Button, 
    Divider 
  } from 'react-native-paper';
  import { SafeAreaView } from 'react-native-safe-area-context';

  import { Avatar } from '@/src/components/Avatar';
  import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

  const Settingscreen = () => {
    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={ styles.container }>
                <View style={ styles.profileInfoContainer }>
                    <View>
                        <Text style={ styles.profileTitles }>Name</Text>
                        <Text style={ styles.profileInfoJoined }>Joined: July 24, 2024</Text>
                        <View style={ styles.profileFlagsContainer }></View>
                    </View>

                    <Avatar width={125} />
                </View>
            </View>

            <View style={ styles.profileStatsContainer }>
                <Text style={ styles.profileTitles }>Statistics</Text>

                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingRight: 3 }}
                    pagingEnabled={true}>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>Spanish</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>French</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>Italian</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>Portuguese</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>Tagalog</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageText}>English</Text>
                    </View>
                </ScrollView>

                <View style={ styles.profileStatsWrapper }>          
                    <View style={ styles.profileStats }>
                        <MaterialCommunityIcons name="trophy-award" size={30} />
                        <Text>Top Language</Text>
                        <Text>Spanish</Text>
                    </View>
                    <View style={ styles.profileStats }>          
                        <MaterialCommunityIcons name="desktop-mac-dashboard" size={30} />
                        <Text>Total Input Hours</Text>
                        <Text>135</Text>
                    </View>
                </View>

                <View style={ styles.profileStatsWrapper }>
                    <View style={ styles.profileStats }>
                        <MaterialCommunityIcons name="calendar" size={30} />
                        <Text>40</Text>
                        <Text>Days Practiced</Text>
                    </View>
                    <View style={ styles.profileStats }>          
                        <MaterialCommunityIcons name="calendar" size={30} />
                        <Text>12</Text>
                        <Text>Day Streak</Text>
                    </View>
                </View>   

                <View style={ styles.profileStatsWrapper }> 
                    <View style={ styles.profileStats }>  
                        <MaterialCommunityIcons name="clock" size={30} />
                        <Text>125</Text>        
                        <Text>Total Hours Spanish</Text>
                    </View>
                    <View style={ styles.profileStats }>
                        <MaterialCommunityIcons name="clock" size={30} />
                        <Text>10</Text>        
                        <Text>Total Hours French</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

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
        //backgroundColor: Colors.light.generalBG, 
        borderWidth: 1, 
        //borderColor: Colors.light.generalBG, 
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
      //backgroundColor: Colors.light.tabsBG,
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginVertical: 10,
      width: 150,
      height: 60,
      borderRightWidth: 1,
      //borderRightColor: Colors.light.background,
    },
    languageText: {
      //color: Colors.light.text,
      fontSize: 16,
      textAlign: 'center',
      width: 150,
    }
  });

export default Settingscreen;