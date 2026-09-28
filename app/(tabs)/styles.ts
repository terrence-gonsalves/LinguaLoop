import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';

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
    }
});

export default styles;