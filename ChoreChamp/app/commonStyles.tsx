// Commonly used styles across the app
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'left',
    },
});
