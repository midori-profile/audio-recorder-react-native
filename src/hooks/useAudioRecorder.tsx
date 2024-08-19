import { useState } from "react";
import { Recording, RawRecording } from "../types/Recording";

export const useAudioRecorder = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  const addRecording = (recordingsArray: RawRecording[]) => {
    console.log("recordingsArray: ", recordingsArray);
    // no pause and resume
    if (recordingsArray.length === 1) {
      const { uri, meterings, duration } = recordingsArray[0];
      if (uri) {
        const meteringNumbers = meterings.map((item) => item.db);
        console.log('meteringNumbers: ', meteringNumbers);

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
      console.log("totalDuration: ", totalDuration);

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

    // const {uri, meterings, duration} = recordingsArray[0]
    // if (uri) {
    //   // 格式化后的 metering 数据
    //   const meteringNumbers = meterings.map((item) => item.db);

    //   setRecordings((existingRecordings) => [
    //     { uri, metering: meteringNumbers, timestamp: Date.now(), duration },
    //     ...existingRecordings,
    //   ]);

    // }
  };

  const deleteRecording = (uri: string) => {
    setRecordings((currentRecordings) =>
      currentRecordings.filter((rec) => rec.uri !== uri)
    );
  };

  return {
    recordings,
    deleteRecording,
    addRecording,
  };
};
