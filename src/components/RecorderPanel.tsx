import React, {
  forwardRef,
  useRef,
  type Ref,
  useState,
} from "react";
import {
  View,
  type ViewStyle,
  TouchableOpacity,
  Text,
  type TextStyle,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";
import { Recorder } from "./Recorder/Recorder";
import {type RecorderRef} from "../types/Recorder.types";

import { useThemeColor } from "../hooks/useThemeColor";
import { Box } from "./Box";
import { Spacing } from "../constants/Spacing";
import { formatTimer } from "../utils/formatTimer";
import { RawRecording } from "../types/Recording";

const RECORD_BUTTON_SIZE = 60;
const RECORDING_INDICATOR_COLOR = "#4169E1";
const RECORDING_INDICATOR_SCALE = 0.5;

const SPRING_SHORT_CONFIG: WithSpringConfig = {
  stiffness: 120,
  overshootClamping: true,
};

export interface RecorderPanelProps {
  lightColor?: string;
  darkColor?: string;
  recording?: Audio.Recording | undefined;
  onStopPress?: () => void;
  onStartPress?: () => void;
  onRecordingComplete: (
    recordings: RawRecording[]
  ) => void;
}

const $ovalButton: ViewStyle = {
  width: RECORD_BUTTON_SIZE + Spacing.md * 2,
  height: RECORD_BUTTON_SIZE,
  borderRadius: RECORD_BUTTON_SIZE / 2,
  backgroundColor: RECORDING_INDICATOR_COLOR,
  justifyContent: "center",
  alignItems: "center",
};

const $resumeText: TextStyle = {
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
};

export interface RecorderPanelRef {
  present: () => void;
}

export const RecorderPanel = forwardRef(
  // because we must pass the ref
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (props: RecorderPanelProps, ref: Ref<RecorderPanelRef>) => {
    const {
      onRecordingComplete,
    } = props;


    const [isRecording, setIsRecording] = useState(false);
    const [position, setPosition] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const recorderRef = useRef<RecorderRef>(null);

    const progressBackgroundColor = useThemeColor({}, "recorderProgress");
    const tintColor = useThemeColor({}, "recorderTint");
    const timelineColor = useThemeColor({}, "recorderTimeline");
    const positionColor = useThemeColor({}, "text");
   
    const recorderBackgroundColor = useThemeColor({}, "recorderBackground");
    const waveformInactiveColor = useThemeColor({}, "recorderWaveformInactive");

    const scale = useSharedValue(1);



    const toggleRecording = async () => {
      try {
        let { granted } = await Audio.getPermissionsAsync();
    
        if (!granted) {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access microphone is required!');
            return;
          }
          granted = status === 'granted';
        }
    
        if (!granted) return;
    
        await Haptics.selectionAsync();
    
        if (isRecording) {
          await recorderRef.current?.stopRecording();
        } else {
          await recorderRef.current?.startRecording();
          setIsPaused(false);
        }
      } catch (error) {
        console.error("Error while toggling recording: ", error);
      }
    };

    const togglePauseResumeRecording = async () => {
      Haptics.selectionAsync();
      if (isPaused) {
        await recorderRef.current?.resumeRecording();
        setIsPaused(false);
      } else {
        await recorderRef.current?.pauseRecording();
        setIsPaused(true);
      }
    };

    const resetRecording = async () => {
      Haptics.selectionAsync();
      await recorderRef.current?.resetRecording();
    };

    const doneRecording = async () => {
      if (recorderRef.current) {
        await recorderRef.current.stopRecording(); // Stop recording
      }
    };

    return (
      <View>
        <Recorder
          ref={recorderRef}
          tintColor={tintColor}
          waveformInactiveColor={waveformInactiveColor}
          progressInterval={50}
          timelineColor={timelineColor}
          backgroundColor={recorderBackgroundColor}
          progressBackgroundColor={progressBackgroundColor}
          onRecordReset={() => {
            scale.value = 1;
            setIsRecording(false);
          }}
          onRecordStart={() => {
            scale.value = withSpring(
              RECORDING_INDICATOR_SCALE,
              SPRING_SHORT_CONFIG
            );
            setIsRecording(true);
          }}
          onRecordStop={(recordingsArray) => {
            scale.value = withSpring(1, SPRING_SHORT_CONFIG);
            setIsRecording(false);
            setIsPaused(false);
            onRecordingComplete(recordingsArray);
          }}
          onPositionChange={(pos: number) => setPosition(pos)}
        />
        {/* 录音时间 */}
        <View style={{ marginTop: Spacing.xxl }}>
          <Text style={[$positionText, { color: positionColor ?? "#333333" }]}>
            {formatTimer(Math.round(position / 100) * 100, true)}
          </Text>
        </View>

        <Box row justify="space-between" align="center" mt={Spacing.lg} mb={Spacing.lg}>
          {/* 重置按钮 */}
          <Box>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[$recordControl, { alignItems: "center" }]}
              onPress={resetRecording}
            >
              <Text style={{ color: RECORDING_INDICATOR_COLOR, fontSize: 16 }}>Reset</Text>
            </TouchableOpacity>
          </Box>

          {/* 录音按钮 */}
          <Box justify="center" align="center" mx={Spacing.xxl}>
            {isRecording ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[$ovalButton, $recordControl]}
                onPress={togglePauseResumeRecording}
              >
                {isPaused ? (
                  <Text style={[$resumeText]}>Resume</Text>
                ) : (
                  <Ionicons
                    name="pause"
                    size={Spacing.xl}
                    style={{ color: "white" }}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <Box>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[$ovalButton, $recordControl]}
                  onPress={toggleRecording}
                >
                  <Text style={[$resumeText]}>Start</Text>
                </TouchableOpacity>
              </Box>
            )}
          </Box>

          {/* Done 按钮 */}
          <Box>
            <TouchableOpacity
              activeOpacity={0.5}
              style={[$recordControl, { alignItems: "center" }]}
              onPress={doneRecording}
            >
              <Text style={{ color: RECORDING_INDICATOR_COLOR, fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </View>
    );
  }
);

RecorderPanel.displayName = "RecorderPanel";

const $recordControl: ViewStyle = {
  padding: Spacing.md,
};

const $positionText: TextStyle = {
  fontWeight: "medium",
  fontSize: 28,
  textAlign: "center",
};