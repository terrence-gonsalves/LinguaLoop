import { StyleSheet, View, ScrollView } from 'react-native';

const styles = StyleSheet.create({
    container: {
        padding: 15,
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
});

export default styles;