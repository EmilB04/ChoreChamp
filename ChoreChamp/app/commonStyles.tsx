// Commonly used styles across the app
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 0,
    },
    header: {
        textAlign: 'left',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 26,
        textAlign: 'left',
        marginTop: 85,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'left',
    },
    saveButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
});
