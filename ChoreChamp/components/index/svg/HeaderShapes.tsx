/*
    SVG Header Shapes for ChoreChamp Application
    This file contains React components that render SVG shapes used in the header section of the app.
    Shapes are responsive and adapt to different screen sizes.
    The figures SVG paths are sourced from Figma designs.
*/

import React from "react";
import Svg, { Path } from "react-native-svg";
import { useWindowDimensions } from "react-native";

interface BackgroundShapeProps {
    fill: string;
    style?: any;
}

// Wide curved background shape
export const BackgroundShape: React.FC<BackgroundShapeProps> = ({
    fill,
    style,
}) => {
    const { width: screenWidth } = useWindowDimensions();

    // Maintain base proportion
    const baseWidth = 347;
    const baseHeight = 175;
    const aspectRatio = baseHeight / baseWidth;

    return (
        <Svg
            width={screenWidth}
            height={screenWidth * aspectRatio}
            viewBox="0 20 347 146"
            preserveAspectRatio="xMidYMid meet"
            style={style}
        >
            <Path
                d="M-9.15527e-05 0.5H346V145.5C273.284 73.4047 209.924 51.8583 124.73 69.9165C42.9585 87.2493 37.1901 59.6197 -9.15527e-05 0.5Z"
                fill={fill}
            />
        </Svg>
    );
};

// Circular accent shape
export const CircularShape: React.FC<BackgroundShapeProps> = ({
    fill,
    style,
}) => {
    const { width: screenWidth } = useWindowDimensions();
    const size = Math.max(28, screenWidth * 0.07); // Responsive sizing

    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 27 27"
            preserveAspectRatio="xMidYMid meet"
            style={style}
        >
            <Path
                d="M20.4541 4.19128C24.9121 8.71509 28.7193 19.9138 24.1954 24.3718C19.6716 28.8298 8.52993 24.8589 4.07193 20.3351C-0.386075 15.8113 -0.332723 8.53012 4.19109 4.07211C8.71491 -0.385888 15.9961 -0.332537 20.4541 4.19128Z"
                fill={fill}
            />
        </Svg>
    );
};

// Small decorative dot
export const SmallDot: React.FC<BackgroundShapeProps> = ({ fill, style }) => {
    const { width: screenWidth } = useWindowDimensions();
    const dotWidth = Math.max(4, screenWidth * 0.012);
    const dotHeight = dotWidth * 1.25;

    return (
        <Svg
            width={dotWidth}
            height={dotHeight}
            viewBox="0 0 4 5"
            preserveAspectRatio="xMidYMid meet"
            style={style}
        >
            <Path
                d="M4 2.28223C4 1.17766 3 -0.717773 2 0.282227C1 1.28223 0 1.17766 0 2.28223C0 3.3868 0.89543 4.28223 2 4.28223C3.10457 4.28223 4 3.3868 4 2.28223Z"
                fill={fill}
            />
        </Svg>
    );
};
