import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
    saWrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 15,
        paddingBottom: 100,
    },
    settingsOptionsContainer: {},
    settingsOptionsTextContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    settingsOptions: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 1,
    },
    settingsOptionsTop: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20, 
        padding: 20,
        marginBottom: 1,
    },
    settingsOptionsBottom: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20, 
        padding: 20,
        marginBottom: 1,
    },
    accountProfileLink: {
        color: Colors.light.link,
    },
    accountHeaderContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    accountTitle: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    accountHeaderTextContainer: {
        marginLeft: 10
    },
    btnsContainer: {
        flex: 1, 
        alignItems: 'center', 
        marginTop: 20 
    },
    delete: {
        color: Colors.light.error,
    },
    logoutBtn: {
        marginTop: 20,
        marginBottom: 10,
        borderColor: Colors.light.outLineBtnText,
        borderRadius: 20,
        borderWidth: 1,
        textAlign: 'center',
        padding: 10,
        width: 110
    },
});

export default styles;