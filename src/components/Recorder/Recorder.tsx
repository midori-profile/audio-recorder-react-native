import React, {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type {
  Metering,
  RecorderProps,
  RecorderRef,
} from "./Recorder.types";
import { Waveform } from "./Waveform";
import {
  METERING_MIN_POWER,
  SPRING_CONFIG,
  TIMELINE_MS_PER_LINE,
  WAVEFORM_LINE_WIDTH,
} from "../../constants/Recorder";

import { Spacing } from "../../constants/Spacing";

const DEFAULT_MAX_DURATION = 120000; // 2m
const DEFAULT_TIMELINE_GAP_PER_250_MS = Spacing.lg;
const DEFAULT_TIMELINE_UPDATE_INTERVAL = 50; // ms

export const Recorder = forwardRef(
  (props: RecorderProps, ref: Ref<RecorderRef>) => {
    const {
      progressInterval = DEFAULT_TIMELINE_UPDATE_INTERVAL,
      onPositionChange,
      onRecordStart,
      onRecordStop,
      onRecordReset,
      timelineGap = DEFAULT_TIMELINE_GAP_PER_250_MS,
      maxDuration = DEFAULT_MAX_DURATION,
      onPauseRecording,
      onResumeRecording,
      ...rest
    } = props;

    let recordingSegments = useRef([]); // 用于存储录音片段

    const forceUpdate = useRef(0);

    const recording = useRef<Audio.Recording>();
    const sound = useRef<Audio.Sound>();
    const recordingUri = useRef<string>();

    const [isRecording, setIsRecording] = useState(false);
    const [isPreviewPlaying, setisPreviewPlaying] = useState(false);

    const [meterings, setMeterings] = useState<Metering[]>([]);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const timelineTotalWidthPer250ms = timelineGap + WAVEFORM_LINE_WIDTH;
    const waveformMaxWidth =
      (duration / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms;

    const isScrollAnimating = useSharedValue(false);
    const scrollX = useSharedValue(0);
    const currentMs = useSharedValue(0);

    const updatePosition = (positionMs: number) => {
      setPosition(positionMs);
      onPositionChange?.(positionMs);
    };

    useDerivedValue(() => {
      if (isPreviewPlaying) return;
      if (isRecording) return;
      if (isScrollAnimating.value) return;

      if (scrollX.value <= 0) {
        const ms =
          Math.floor(
            ((Math.abs(scrollX.value) / timelineTotalWidthPer250ms) *
              TIMELINE_MS_PER_LINE) /
              100
          ) * 100;

        if (ms <= duration && ms !== currentMs.value) {
          runOnJS(updatePosition)(ms);
          currentMs.value = ms;
        }
      } else {
        runOnJS(updatePosition)(0);
      }
    });


    const handleRecordingStatus = (status: Audio.RecordingStatus) => {
      if (status.isRecording && status.durationMillis > 0) {
        setDuration(status.durationMillis);

        if (status.durationMillis > maxDuration) {
          return;
        }

        updatePosition(status.durationMillis);
        setMeterings((prev) => {
          return [
            ...prev,
            {
              position: status.durationMillis,
              key: status.durationMillis + prev.length,
              db: status.metering ?? METERING_MIN_POWER,
            },
          ];
        });
      }
    };

    const record = async () => {
      if (isRecording) return;
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = undefined; // 清理当前录音对象
      }

      setMeterings([]);
      updatePosition(0);
      setIsRecording(true);

      const newRecording = new Audio.Recording();
      recording.current = newRecording;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      newRecording.setProgressUpdateInterval(progressInterval);
      newRecording.setOnRecordingStatusUpdate(handleRecordingStatus);

      try {
        await newRecording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        const status = await newRecording.startAsync();
        onRecordStart?.(status.uri);
      } catch (error) {
        console.error("Failed to start recording:", error);
        // Handle the error (e.g., show a message to the user)
      }
    };

    const reset = async () => {
      setisPreviewPlaying(false);
      setIsRecording(false);
      setIsPaused(false);

      setMeterings([]);
      updatePosition(0);
      setDuration(0);

      recordingUri.current = undefined;
      recordingSegments.current = [];
      // @ts-ignore
      // recordingSegments = [];

      await recording.current?.stopAndUnloadAsync();
      recording.current = undefined;

      await sound.current?.stopAsync();
      await sound.current?.unloadAsync();
      sound.current = undefined;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      onRecordReset?.();

      setTimeout(() => {
        scrollX.value = 0;
        forceUpdate.current += 1;
      });
    };

    // Pause recording
    const pauseRecording = async () => {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync(); // 停止并保存当前录音
        const uri = recording.current.getURI(); // 获取录音的URI
        if (uri) {
          recordingSegments.current.push({
            uri,
            meterings: [...meterings], // Store the metering data
            duration: duration, // Store the duration of the segment
          });
        }
        recording.current = undefined; // 清空当前录音
        setIsPaused(true);
        setIsRecording(false);
      }
    };

    // Resume recording
    const resumeRecording = async () => {
      if (!isPaused) return;
      const lastSegment =
        recordingSegments.current[recordingSegments.current.length - 1];
      // @ts-ignore
      const offsetDuration = lastSegment ? lastSegment.duration : 0;

      const newRecording1 = new Audio.Recording();
      await newRecording1.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      ); // 准备新的录音
      await newRecording1.startAsync(); // 开始新的录音
      recording.current = newRecording1; // 将新录音赋值给当前录音
      // 设置更新间隔和状态更新处理函数
      newRecording1.setProgressUpdateInterval(progressInterval);
      newRecording1.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.durationMillis > 0) {
          const adjustedDuration = status.durationMillis + offsetDuration; // 累加到前面的时间
          setDuration(adjustedDuration);

          updatePosition(adjustedDuration);
          setMeterings((prev) => [
            ...prev,
            {
              position: adjustedDuration,
              key: adjustedDuration + prev.length,
              db: status.metering ?? METERING_MIN_POWER,
            },
          ]);
        }
      });

      setIsPaused(false);
      setIsRecording(true);
    };

    const resetScroll = (callback: () => void) => {
      isScrollAnimating.value = true;
      scrollX.value = withSpring(0, SPRING_CONFIG, () => {
        isScrollAnimating.value = false;
        runOnJS(callback)();
      });
    };

    const stopRecording = async () => {
      await recording.current?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      // let durationMillis: number | undefined;
      const uri = recording.current?.getURI();
      if (uri) {
        // const newSound = new Audio.Sound();
        // newSound.setOnPlaybackStatusUpdate(handlePlaybackStatus);
        // await newSound.loadAsync({ uri });
        // await newSound.setProgressUpdateIntervalAsync(progressInterval);
        // Sync position and duration ms
        // const currentStatus = await newSound.getStatusAsync();
        // if (currentStatus.isLoaded) {
        // durationMillis = currentStatus.durationMillis ?? duration;
        // await newSound.setPositionAsync(durationMillis);

        // updatePosition(durationMillis);
        // setDuration(durationMillis);
        // }

        // sound.current = newSound;
        recordingUri.current = uri;
        // @ts-ignore
        recordingSegments.current.push({
          uri,
          meterings: [...meterings],
          duration,
        });
      }
      onRecordStop?.(recordingSegments.current);
      recording.current = undefined;
      // scrollX.value = 0; // 确保动画完成后重置
      setIsRecording(false);
      setIsPaused(false);
      setMeterings([]);
      updatePosition(0);
      // setDuration(0);
      recordingSegments.current = [];
    };

    useEffect(() => {
      if (isRecording) {
        scrollX.value = withTiming(-waveformMaxWidth, {
          duration: progressInterval,
        });
      }
    }, [isRecording, waveformMaxWidth]);

    useEffect(() => {
      if (isPreviewPlaying) {
        const x =
          (position / TIMELINE_MS_PER_LINE) * timelineTotalWidthPer250ms;
        scrollX.value = withTiming(-Math.min(x, waveformMaxWidth), {
          duration: progressInterval,
        });
      }
    }, [isPreviewPlaying, position]);

    useEffect(() => {
      if (isRecording && duration >= maxDuration) {
        stopRecording();
      }
    }, [duration, isRecording, maxDuration]);

    useEffect(() => {
      if (isRecording) {
        scrollX.value = withSpring(0, SPRING_CONFIG);
      }
    }, [isRecording]);

    useImperativeHandle(ref, () => ({
      startRecording: async () => {
        if (meterings.length > 0) {
          resetScroll(record);
        } else {
          await record();
        }
      },
      stopRecording,
      resetRecording: async () => {
        // if (isRecording) return;

        if (meterings.length > 0) {
          resetScroll(reset);
        } else {
          await reset();
        }
      },
      pauseRecording,
      resumeRecording,
    }));

    return (
      <Waveform
        timelineGap={timelineGap}
        maxDuration={maxDuration}
        meterings={isRecording ? meterings.slice(-60) : meterings}
        waveformMaxWidth={waveformMaxWidth}
        recording={isRecording}
        playing={isPreviewPlaying}
        scrollX={scrollX}
        {...rest}
      />
    );
  }
);
