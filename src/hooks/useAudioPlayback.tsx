import { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Recording } from "../types/Recording";

export const useAudioPlayback = (recording: Recording) => {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);

  // 使用 useEffect 监听 currentSoundIndex 的变化
useEffect(() => {
  if (sounds.length > 0 && currentSoundIndex <= sounds.length - 1 && currentSoundIndex > 0) {
    console.log(2);
    sounds[currentSoundIndex].setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    sounds[currentSoundIndex].playAsync().then(() => {
      console.log(3);
    }).catch(error => {
      console.error("播放音频时发生错误:", error);
    });
  }
}, [currentSoundIndex, sounds]);

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    // 检查当前音频是否播放完毕
    if (newStatus.isLoaded && newStatus.didJustFinish) {
      if (currentSoundIndex < sounds.length - 1) {
        const nextIndex = currentSoundIndex + 1;
        setCurrentSoundIndex(nextIndex);
      } else {
        for (const sound of sounds) {
          await sound.stopAsync();
          await sound.setPositionAsync(0);
        }
        setCurrentSoundIndex(0);
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
      
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recording.uri },
          { progressUpdateIntervalMillis: 1000 / 60 },
          onPlaybackStatusUpdate
        );
        setSounds([sound]);
      } catch (error) {
        console.error('Error creating sound object:', error);
      }
    }
  }

  async function playSound() {
    if (!sounds.length) return;

    // Attach the status update callback to the current sound
    sounds[0].setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    await sounds[0].playAsync();
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
