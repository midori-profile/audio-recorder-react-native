import React, {
  forwardRef,
  useRef,
  type Ref,
  useState,
  useEffect,
} from "react";
import {
  View,
  type ViewStyle,
  TouchableOpacity,
  Text,
  type TextStyle,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export interface ThemedRecorderSheetProps {
  lightColor?: string;
  darkColor?: string;
  recording?: Audio.Recording | undefined; // New prop for current recording
  onStopPress?: () => void; // New prop for stopping recording
  onStartPress?: () => void; // New prop for starting recording
  onRecordingComplete: (
    recordings: RawRecording[]
  ) => void;
}

const $ovalButton: ViewStyle = {
  width: RECORD_BUTTON_SIZE + Spacing.md * 2, // 使按钮宽度比高度大，形成椭圆
  height: RECORD_BUTTON_SIZE,
  borderRadius: RECORD_BUTTON_SIZE / 2,
  backgroundColor: RECORDING_INDICATOR_COLOR, // 使用录音指示颜色
  justifyContent: "center",
  alignItems: "center",
};

const $resumeText: TextStyle = {
  color: "white", // 白色文字
  fontSize: 16, // 文字大小
  fontWeight: "bold", // 文字加粗
};

export interface ThemedRecorderSheetRef {
  present: () => void;
}

export const ThemedRecorderSheet = forwardRef(
  (props: ThemedRecorderSheetProps, ref: Ref<ThemedRecorderSheetRef>) => {
    const {
      lightColor,
      darkColor,
      onRecordingComplete,
    } = props;

    const insets = useSafeAreaInsets();

    // 录音和播放状态的管理
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [isPaused, setIsPaused] = useState(false); // 新增暂停状态

    const recorderRef = useRef<RecorderRef>(null);

    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "recorderSheet"
    );
    const progressBackgroundColor = useThemeColor({}, "recorderProgress");
    const iconColor = useThemeColor({}, "recorderIcon");
    const tintColor = useThemeColor({}, "recorderTint");
    const timelineColor = useThemeColor({}, "recorderTimeline");
    const positionColor = useThemeColor({}, "text");
    const recordBorderColor = useThemeColor(
      { light: "rgba(0,0,0,0.3)" },
      "text"
    );
    const recorderBackgroundColor = useThemeColor({}, "recorderBackground");
    const waveformInactiveColor = useThemeColor({}, "recorderWaveformInactive");

    const scale = useSharedValue(1);



    const toggleRecording = async () => {
      const permissionStatus = await Audio.getPermissionsAsync();
      if (!permissionStatus.granted) return;

      Haptics.selectionAsync();
      if (isRecording) {
        // onStopPress();
        await recorderRef.current?.stopRecording();
      } else {
        // onStartPress();
        await recorderRef.current?.startRecording();
        setIsPaused(false); // 开始录音时重置暂停状态
      }
    };

    // 新增：暂停或恢复录音

    const togglePauseResumeRecording = async () => {
      Haptics.selectionAsync();
      if (isPaused) {
        await recorderRef.current?.resumeRecording(); // 恢复录音
        setIsPaused(false);
      } else {
        await recorderRef.current?.pauseRecording(); // 暂停录音
        setIsPaused(true);
      }
    };

    // 重置录音
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
            setIsPlaying(false);
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

            
            // @ts-ignore
            onRecordingComplete(recordingsArray);
          }}
          onPlaybackStart={() => setIsPlaying(true)}
          onPlaybackStop={() => setIsPlaying(false)}
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
                style={[$ovalButton, $recordControl]} // 保持原来的样式
                onPress={togglePauseResumeRecording}
              >
                {isPaused ? (
                  <Text style={[$resumeText]}>Resume</Text> // 使用红色文字
                ) : (
                  <Ionicons
                    name="pause" // 显示暂停图标
                    size={Spacing.xl}
                    style={{ color: "white" }}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <Box>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[$ovalButton, $recordControl]} // 使用与Resume相同的椭圆样式
                  onPress={toggleRecording} // 保持原有的功能
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


const $recordControl: ViewStyle = {
  padding: Spacing.md,
};

const $positionText: TextStyle = {
  fontWeight: "medium",
  fontSize: 28,
  textAlign: "center",
};
