import { useState } from "react";
import { Recording, RawRecording } from "../types/Recording";

export const useAudioRecorder = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  const addRecording = (recordingsArray: RawRecording[]) => {
    // if there was no pause and resume
    if (recordingsArray.length === 1) {
      const { uri, meterings, duration } = recordingsArray[0];
      if (uri) {
        const meteringNumbers = meterings.map((item) => item.db);

        setRecordings((existingRecordings) => [
          { uri, metering: meteringNumbers, timestamp: Date.now(), duration },
          ...existingRecordings,
        ]);
      }
    } else if (recordingsArray.length > 1) {
      // Merge recordings into one logical recording object
      const mergedUri = recordingsArray.map((rec) => rec.uri);
      const mergedMeterings = recordingsArray[recordingsArray.length - 1].meterings.map(
        (item) => item.db
      );
      const totalDuration = recordingsArray[recordingsArray.length - 1].duration;

      setRecordings((existingRecordings) => [
        {
          uri: mergedUri,
          metering: mergedMeterings,
          timestamp: Date.now(),
          duration: totalDuration,
          durations: recordingsArray.map((rec) => rec.duration),
        },
        ...existingRecordings,
      ]);
    }
  };

  const deleteRecording = (uri: string | string[]) => {
    setRecordings((currentRecordings) =>
      currentRecordings.filter((rec) => {
        if (typeof uri === 'string' && typeof rec.uri === 'string') {
          return rec.uri !== uri;
        }
        if (Array.isArray(uri) && Array.isArray(rec.uri)) {
          return rec.uri.join('') !== uri.join('');
        }
        return true;
      })
    );
  };

  return {
    recordings,
    deleteRecording,
    addRecording,
  };
};
