import React from "react";
import { View, StyleSheet } from "react-native";
import { Extrapolate, interpolate } from "react-native-reanimated";

interface Props {
  lines: number[];
  progress: number;
}

export const AudioWave = ({ lines, progress }: Props) => {
  return (
    <View style={styles.wave}>
      {lines.map((db, idx) => (
        <View
          key={`${db}[${idx}]`}
          style={[
            styles.waveLine,
            {
              height: interpolate(db, [-60, 0], [5, 50], Extrapolate.CLAMP),
              backgroundColor:
                progress > idx / lines.length ? "royalblue" : "gainsboro",
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wave: {
    width: "100%",
    gap: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  waveLine: {
    flex: 1,
    backgroundColor: "gainsboro",
    borderRadius: 20,
  },
});
