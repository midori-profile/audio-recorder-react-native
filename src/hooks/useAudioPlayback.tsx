import { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Recording } from "../types/Recording";

export const useAudioPlayback = (recording: Recording) => {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      if (currentSoundIndex < sounds.length - 1) {
        const nextIndex = currentSoundIndex + 1;
        setCurrentSoundIndex(nextIndex);
        await sounds[nextIndex].playAsync();
      } else {
        await stopSound();
      }
    }
  }

  async function loadSounds() {
    if (Array.isArray(recording.uri)) {
      const loadedSounds = await Promise.all(
        recording.uri.map(async (uri) => {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { progressUpdateIntervalMillis: 1000 / 60 }
          );
          return sound;
        })
      );
      setSounds(loadedSounds);
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { progressUpdateIntervalMillis: 1000 / 60 }
      );
      setSounds([sound]);
    }
  }

  async function playSound() {
    if (!sounds.length) return;

    // Attach the status update callback to the current sound
    sounds[currentSoundIndex].setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

    // if (status?.isPlaying) {
    //   await sounds[currentSoundIndex].pauseAsync();
    // } else {
      await sounds[currentSoundIndex].playAsync();
    // }
  }

  async function pauseSound() {
    if (!sounds.length) return;
    await sounds[currentSoundIndex].pauseAsync();
  }

  async function stopSound() {
    if (!sounds.length) return;

    for (const sound of sounds) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
    }
    setCurrentSoundIndex(0);
    setStatus(null);
  }

  useEffect(() => {
    loadSounds();

    return () => {
      sounds.forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, [recording]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;

  return {
    status,
    isPlaying,
    playSound,
    pauseSound,
    stopSound, // Expose stopSound for use in the UI
    currentSoundIndex,
  };
};
