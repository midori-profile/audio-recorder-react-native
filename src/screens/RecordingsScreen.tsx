import React, { useRef } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecordingListItem } from "../components/RecordingListItem";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
  ThemedRecorderSheet,
  type ThemedRecorderSheetRef,
} from "../components/RecorderPanel";

export const RecordingsScreen = () => {
  const { recordings, addRecording, deleteRecording } = useAudioRecorder();

  const recorderRef = useRef<ThemedRecorderSheetRef>(null);
  recorderRef.current?.present();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Container to hold the list and the footer */}
      <View style={styles.content}>
        <FlatList
          contentContainerStyle={styles.list}
          data={recordings}
          renderItem={({ item }) => (
            <RecordingListItem recording={item} onDelete={deleteRecording}/>
          )}
          keyExtractor={(item) =>
            Array.isArray(item.uri) ? item.uri.join("-") : item.uri
          }
        />
      </View>

      {/* Always fixed at the bottom */}
      <View style={styles.footer}>
        <ThemedRecorderSheet
          ref={recorderRef}
          onRecordingComplete={addRecording}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
  content: {
    flex: 1, // Take up the remaining space
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20, // To avoid overlapping with the footer
  },
  footer: {
    backgroundColor: "#fff", // To match the footer with the background
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});

export default RecordingsScreen;
