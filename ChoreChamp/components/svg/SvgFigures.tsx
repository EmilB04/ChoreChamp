import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundShape, CircularShape, SmallDot } from './HeaderShapes';

// Get screen dimensions for responsive positioning
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SvgFiguresProps {
    tintColor: string;
}

// Create responsive styles based on screen dimensions
const createResponsiveStyles = (safeAreaTop: number) => {
    const responsiveHeight = Math.max(200, screenHeight * 0.25); // At least 200px or 25% of screen
    const circularSize = Math.max(20, screenWidth * 0.07); // Responsive size: 7% of screen width, min 20px
    const dotSize = Math.max(3, screenWidth * 0.012); // Responsive size: 1.2% of screen width, min 3px
    
    return StyleSheet.create({
        backgroundShapePosition: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            height: responsiveHeight,
        },
        svgBackground: {
            width: "100%",
            height: responsiveHeight,
        },
        circularShapePosition: {
            position: "absolute",
            top: safeAreaTop + responsiveHeight * 0.45, // 45% down from safe area
            right: screenWidth * 0.25, // 25% from right edge
            zIndex: 1,
        },
        circularSvg: {
            width: circularSize,
            height: circularSize,
            zIndex: 1,
        },
        smallDotPosition: {
            position: "absolute",
            top: safeAreaTop + responsiveHeight * 0.6, // 60% down from safe area
            right: screenWidth * 0.23, // 23% from right edge
            zIndex: 1,
        },
        smallDotSvg: {
            width: dotSize,
            height: dotSize * 1.25, // Maintain aspect ratio
        },
    });
};

// Individual SVG figure components with responsive behavior
const BackgroundShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const styles = createResponsiveStyles(insets.top);
    
    return (
        <View style={styles.backgroundShapePosition}>
            <BackgroundShape
                fill={tintColor}
                style={styles.svgBackground}
            />
        </View>
    );
};

const CircularShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const styles = createResponsiveStyles(insets.top);
    
    return (
        <View style={styles.circularShapePosition}>
            <CircularShape
                fill={tintColor}
                style={styles.circularSvg}
            />
        </View>
    );
};

const SmallDotFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => {
    const insets = useSafeAreaInsets();
    const styles = createResponsiveStyles(insets.top);
    
    return (
        <View style={styles.smallDotPosition}>
            <SmallDot
                fill={tintColor}
                style={styles.smallDotSvg}
            />
        </View>
    );
};

const SvgFigures = {
    BackgroundShape: BackgroundShapeFigure,
    CircularShape: CircularShapeFigure,
    SmallDot: SmallDotFigure,
};

export default SvgFigures;