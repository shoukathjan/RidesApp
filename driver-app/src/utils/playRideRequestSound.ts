import { Audio } from 'expo-av';

let primed = false;

async function ensureAudioMode(): Promise<void> {
  if (primed) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
  primed = true;
}

/** Short alert when a new nearby ride request appears. */
export async function playRideRequestSound(): Promise<void> {
  try {
    await ensureAudioMode();
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/ride-request.wav'),
      { shouldPlay: true, volume: 1 },
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    // Ignore playback errors (e.g. simulator without audio).
  }
}
