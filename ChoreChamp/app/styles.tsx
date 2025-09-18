// Commonly used styles across the app
import { StyleSheet } from 'react-native';


export const commonStyles = StyleSheet.create({
    
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        textAlign: 'left',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 26,
        textAlign: 'left',
        alignContent: 'flex-start',
        alignSelf: 'flex-start',
        marginTop: 85,
        fontWeight: 'bold',
    }
});