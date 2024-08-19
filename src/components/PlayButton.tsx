import { TouchableOpacity, View, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;  // Add onStop prop
}

export const PlayButton = ({ isPlaying, onPlay, onPause, onStop }: Props) => {
  return (
    <View style={styles.container}>
      {/* Play/Pause Button */}
      <TouchableOpacity onPress={isPlaying ? onPause : onPlay} style={styles.button}>
        <FontAwesome5
          name={isPlaying ? "pause" : "play"}
          size={18}
          color="#a6a6a6"
        />
      </TouchableOpacity>

      {/* Stop Button */}
      <TouchableOpacity onPress={onStop} style={styles.button}>
        <FontAwesome5
          name="stop"
          size={18}
          color="#a6a6a6"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginHorizontal: 5,  // Add some spacing between the buttons
  },
});
