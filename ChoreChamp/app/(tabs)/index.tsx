import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Svg, { Path } from "react-native-svg";

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.backgroundShape}>
        <Svg
          width="100%"
          height={200}
          viewBox="0 20 347 146"
          style={styles.svgBackground}
          preserveAspectRatio="none"
        >
          <Path
            d="M-9.15527e-05 0.5H290.5C290.5 0.5 306.722 0.753072 310 1.5C331.059 6.29817 336.662 15.3068 342 26.5C347.338 37.6932 346 71.5 346 71.5V145.5C273.284 73.4047 209.924 51.8583 124.73 69.9165C42.9585 87.2493 37.1901 59.6197 -9.15527e-05 0.5Z"
            fill="#FFBE00"
          />
        </Svg>
      </View>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting]}>God dag,</Text>
            <Text style={[styles.userName]}>
              Bruker! {/* Replace with actual username from backend */}
            </Text>
          </View>
          <View style={styles.profileSection}>
            <View style={styles.circularShape}>
              <Svg
                width={27}
                height={27}
                viewBox="0 0 27 27"
                style={styles.circularSvg}
              >
                <Path
                  d="M20.4541 4.19128C24.9121 8.71509 28.7193 19.9138 24.1954 24.3718C19.6716 28.8298 8.52993 24.8589 4.07193 20.3351C-0.386075 15.8113 -0.332723 8.53012 4.19109 4.07211C8.71491 -0.385888 15.9961 -0.332537 20.4541 4.19128Z"
                  fill="#FFBE00"
                />
              </Svg>
            </View>
            <View style={styles.smallDot}>
              <Svg
                width={4}
                height={5}
                viewBox="0 0 4 5"
                style={styles.smallDotSvg}
              >
                <Path
                  d="M4 2.28223C4 1.17766 3 -0.717773 2 0.282227C1 1.28223 0 1.17766 0 2.28223C0 3.3868 0.89543 4.28223 2 4.28223C3.10457 4.28223 4 3.3868 4 2.28223Z"
                  fill="#FFBE00"
                />
              </Svg>
            </View>
            <View style={styles.profileContainer}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.profileImage}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    position: "relative",
    zIndex: 1,
  },
  backgroundShape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  svgBackground: {
    width: "100%",
    height: 200,
  },
  circularShape: {
    position: "absolute",
    top: -15,
    left: -45,
    zIndex: 1,
  },
  circularSvg: {
    width: 27,
    height: 27,
  },
  smallDot: {
    position: "absolute",
    top: 15,
    right: 71,
    zIndex: 1,
  },
  smallDotSvg: {
    width: 4,
    height: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 30,
    marginVertical: 40,
    zIndex: 1,
    position: "relative",
  },
  profileSection: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "normal",
    color: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  profileContainer: {
    width: 58,
    height: 58,
    borderRadius: 20,
    padding: 2,
    backgroundColor: "#FFBE00",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  titleContainer: {
    color: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
