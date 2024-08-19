export type Recording = {
  uri: string | string[];
  metering: number[];
  timestamp: number;
  duration: number;
  durations?: number[];
};

export type RawRecording = {
  uri: string;
  meterings: {
    db: number;
    key: number;
    position: number;
  }[];
  duration: number;
};
