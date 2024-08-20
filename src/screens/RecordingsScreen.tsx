import React, { useRef } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecordingListItem } from "../components/RecordingListItem";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
  RecorderPanel,
  type RecorderPanelRef,
} from "../components/RecorderPanel";

export const RecordingsScreen = () => {
  const { recordings, addRecording, deleteRecording } = useAudioRecorder();

  const recorderRef = useRef<RecorderPanelRef>(null);
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
        <RecorderPanel
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
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});

export default RecordingsScreen;
