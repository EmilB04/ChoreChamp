import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundShape, CircularShape, SmallDot } from './HeaderShapes';


interface SvgFiguresProps {
    tintColor: string;
}

const createResponsiveStyles = (safeAreaTop: number, screenWidth: number, screenHeight: number) => {
    return StyleSheet.create({
        // Background curve
        backgroundShapePosition: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
        },
        svgBackground: {
            width: '100%',
        },

        // Circular shape positioning
        circularShapePosition: {
            position: 'absolute',
            top: 85,
            right: screenWidth * 0.25,
            zIndex: 1,
        },

        // Small dot positioning
        smallDotPosition: {
            position: 'absolute',
            top: 115,
            right: screenWidth * 0.23,
            zIndex: 1,
        },
    });
};

const BackgroundShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const styles = createResponsiveStyles(insets.top, width, height);

    return (
        <View style={styles.backgroundShapePosition}>
            <BackgroundShape fill={tintColor} style={styles.svgBackground} />
        </View>
    );
};

const CircularShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const styles = createResponsiveStyles(insets.top, width, height);

    return (
        <View style={styles.circularShapePosition}>
            <CircularShape fill={tintColor} />
        </View>
    );
};

const SmallDotFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const styles = createResponsiveStyles(insets.top, width, height);

    return (
        <View style={styles.smallDotPosition}>
            <SmallDot fill={tintColor} />
        </View>
    );
};

const SvgFigures = {
    BackgroundShape: BackgroundShapeFigure,
    CircularShape: CircularShapeFigure,
    SmallDot: SmallDotFigure,
};

export default SvgFigures;