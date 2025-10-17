import React from "react";
import { StyleSheet, View} from "react-native";

/*
OnboardingDots Component
    - Displays 4 dots to represent onboarding progress.
    - Highlights the active dot based on the activeIndex prop.
*/

type props = {
    activeIndex: number;
    total?: number;
};

export default function OnboardingDots({activeIndex, total = 4}: props) {
    const items = Array.from({ length: total }, (_, i) => i);
    return (
        <View style={styles.container}>
            {items.map((i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            opacity: i === activeIndex ? 1 : 0.3,
                            backgroundColor: i === activeIndex ? '#FFC107' : '#fff',
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

