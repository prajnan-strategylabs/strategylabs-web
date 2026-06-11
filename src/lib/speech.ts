import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

const isNative = Capacitor.isNativePlatform();

export type DictationHandle = { stop: () => void };

/**
 * Starts voice dictation. Calls onText with the live transcript as the user
 * speaks, and onEnd when recognition stops (by stop(), silence, or error).
 * Returns null if speech recognition isn't available on this platform.
 */
export async function startDictation(
  onText: (transcript: string) => void,
  onEnd: () => void
): Promise<DictationHandle | null> {
  if (isNative) {
    try {
      const { available } = await SpeechRecognition.available();
      if (!available) return null;

      const perm = await SpeechRecognition.requestPermissions();
      if (perm.speechRecognition !== "granted") return null;

      const listener = await SpeechRecognition.addListener(
        "partialResults",
        (data: { matches: string[] }) => {
          if (data.matches?.length) onText(data.matches[0]);
        }
      );

      const cleanup = () => {
        listener.remove();
        onEnd();
      };

      await SpeechRecognition.start({
        language: "en-US",
        partialResults: true,
        popup: false,
      });

      let stopped = false;
      return {
        stop: () => {
          if (stopped) return;
          stopped = true;
          SpeechRecognition.stop().catch(() => {});
          cleanup();
        },
      };
    } catch {
      onEnd();
      return null;
    }
  }

  // Web fallback: Web Speech API (Chrome/Edge)
  const SR =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;

  const rec = new SR();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = true;

  rec.onresult = (e: any) => {
    let transcript = "";
    for (let i = 0; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    onText(transcript.trim());
  };
  rec.onend = onEnd;
  rec.onerror = onEnd;

  try {
    rec.start();
  } catch {
    return null;
  }

  return { stop: () => rec.stop() };
}
