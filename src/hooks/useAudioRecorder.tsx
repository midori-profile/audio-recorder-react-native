import { useState } from "react";
import { Recording } from "../types/Recording";

export const useAudioRecorder = () => {

  const [recordings, setRecordings] = useState<Recording[]>([]);

  const addRecording = (recordingsArray) => {
    
    const {uri, meterings, duration} = recordingsArray[0]
    if (uri) {
      // 格式化后的 metering 数据
      const meteringNumbers = meterings.map((item) => item.db);
  
      setRecordings((existingRecordings) => [
        { uri, metering: meteringNumbers, timestamp: Date.now(), duration },
        ...existingRecordings,
      ]);

    }
  };

  const deleteRecording = (uri: string) => {
    setRecordings((currentRecordings) =>
      currentRecordings.filter((rec) => rec.uri !== uri)
    );
  };

  return {
    recordings,
    deleteRecording,
    addRecording
  };
};
