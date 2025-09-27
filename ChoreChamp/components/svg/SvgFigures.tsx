import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BackgroundShape, CircularShape, SmallDot } from './HeaderShapes';

interface SvgFiguresProps {
    tintColor: string;
}

const svgStyles = StyleSheet.create({
    backgroundShapePosition: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        height: 200,
    },
    svgBackground: {
        width: "100%",
        height: 200,
    },
    circularShapePosition: {
        position: "absolute",
        top: 90,
        right: 95,
        zIndex: 1,
    },
    circularSvg: {
        width: 27,
        height: 27,
        zIndex: 1,
    },
    smallDotPosition: {
        position: "absolute",
        top: 120,
        right: 90,
        zIndex: 1,
    },
    smallDotSvg: {
        width: 4,
        height: 5,
    },
});

// Individual SVG figure components
const BackgroundShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => (
    <View style={svgStyles.backgroundShapePosition}>
        <BackgroundShape
            fill={tintColor}
            style={svgStyles.svgBackground}
        />
    </View>
);

const CircularShapeFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => (
    <View style={svgStyles.circularShapePosition}>
        <CircularShape
            fill={tintColor}
            style={svgStyles.circularSvg}
        />
    </View>
);

const SmallDotFigure: React.FC<SvgFiguresProps> = ({ tintColor }) => (
    <View style={svgStyles.smallDotPosition}>
        <SmallDot
            fill={tintColor}
            style={svgStyles.smallDotSvg}
        />
    </View>
);

// Export as namespace object
const SvgFigures = {
    BackgroundShape: BackgroundShapeFigure,
    CircularShape: CircularShapeFigure,
    SmallDot: SmallDotFigure,
};

export default SvgFigures;