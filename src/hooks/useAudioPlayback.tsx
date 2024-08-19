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

    // If playback finishes, reset the position and pause the sound
    // if (newStatus.isLoaded && newStatus.didJustFinish) {
    //   await stopSound();
    // }
    if (newStatus.isLoaded && newStatus.didJustFinish) {
      if (currentSoundIndex < sounds.length - 1) {
        setCurrentSoundIndex(currentSoundIndex + 1);
        await sounds[currentSoundIndex + 1].playAsync();
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
            { progressUpdateIntervalMillis: 1000 / 60 },
            onPlaybackStatusUpdate
          );
          return sound;
        })
      );
      setSounds(loadedSounds);
      
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { progressUpdateIntervalMillis: 1000 / 60 },
        onPlaybackStatusUpdate
      );
      setSounds([sound]);
    }
  }
  async function playSound() {
    if (!sounds.length) return;
    
    if (status?.isPlaying) {
      await sounds[currentSoundIndex].pauseAsync();
    } else {
      await sounds[currentSoundIndex].playAsync();
    }
  }

  async function pauseSound() {
    if (!sounds.length) return;
    await sounds[currentSoundIndex].pauseAsync();
  }

  async function stopSound() {
    if (!sounds.length) return;
    await sounds[currentSoundIndex].stopAsync();
    await sounds[currentSoundIndex].setPositionAsync(0);
    setCurrentSoundIndex(0);
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
  };
};
