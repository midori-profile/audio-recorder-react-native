import { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Recording } from "../types/Recording";

export const useAudioPlayback = (recording: Recording) => {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [sound, setSound] = useState<Sound>();

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    // If playback finishes, reset the position and pause the sound
    if (newStatus.isLoaded && newStatus.didJustFinish) {
      await stopSound();
    }
  }

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recording.uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    );
    setSound(sound);
  }

  async function playSound() {
    if (!sound) return;
    
    if (status?.isPlaying) {
      await sound.pauseAsync();  // Pause if already playing
    } else {
      await sound.playAsync();  // Play or resume from paused position
    }
  }

  async function pauseSound() {
    if (!sound) return;
    await sound.pauseAsync();
  }

  async function stopSound() {
    if (!sound) return;
    await sound.stopAsync();  // Stop playback and reset position
    await sound.setPositionAsync(0);  // Reset position to the start
  }

  useEffect(() => {
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;

  return {
    status,
    isPlaying,
    playSound,
    pauseSound,
    stopSound,  // Expose stopSound for use in the UI
  };
};
