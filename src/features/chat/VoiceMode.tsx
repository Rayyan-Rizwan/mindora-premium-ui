import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import type { CompanionState } from "@/components/avatar/states";
import { useCompanion } from "@/hooks/useCompanion";
import { Alert, Badge } from "@/components/ui";
import { CloseIcon, MicIcon, SpeakerIcon } from "@/components/ui/icons";
import {
  getSpeechRecognition,
  isSpeechSynthesisSupported,
  type SpeechRecognitionLike,
} from "@/lib/speech";

export type VoiceSendOutcome =
  | { ok: true; reply: string }
  | { ok: false; message: string };

type VoicePhase = "idle" | "listening" | "thinking" | "speaking" | "error";

const PHASE_COPY: Record<
  VoicePhase,
  { label: string; hint: string; lumi: CompanionState }
> = {
  idle: {
    label: "Ready when you are",
    hint: "Tap the microphone, then speak naturally. Nothing starts until you do.",
    lumi: "encouraging",
  },
  listening: {
    label: "Listening",
    hint: "Speak, then tap the microphone again to send your words as a message.",
    lumi: "listening",
  },
  thinking: {
    label: "Thinking",
    hint: "Your words are with the chat service. The reply will be spoken here.",
    lumi: "thinking",
  },
  speaking: {
    label: "Speaking",
    hint: "Stop the voice at any time to read the reply instead.",
    lumi: "responding",
  },
  error: {
    label: "Something interrupted",
    hint: "Read the note below, then try again or return to text chat.",
    lumi: "error",
  },
};

function recognitionErrorMessage(reason: string): string {
  if (reason === "not-allowed" || reason === "service-not-allowed") {
    return "Microphone access was blocked. Allow it in your browser settings, then try again. Text chat is unaffected.";
  }
  if (reason === "audio-capture") {
    return "No microphone was found. Check that one is connected, or return to text chat.";
  }
  if (reason === "network") {
    return "The browser’s speech recognition service could not be reached. This recognition runs through the browser, not Mindora. Try again or use text chat.";
  }
  if (reason === "no-speech") {
    return "No speech was heard. Tap the microphone when you’re ready to try again.";
  }
  return "Speech recognition stopped unexpectedly. You can try again or return to text chat.";
}

interface VoiceModeProps {
  open: boolean;
  demo: boolean;
  onSend: (text: string) => Promise<VoiceSendOutcome>;
  onClose: (returnToText: boolean) => void;
}

/**
 * One-turn-at-a-time voice overlay. Speech recognition and synthesis are the
 * browser's; the recognized text goes through the existing chat API. This is
 * not live audio streaming and does not use a Mindora voice service.
 */
export function VoiceMode({ open, demo, onSend, onClose }: VoiceModeProps) {
  const { character } = useCompanion();
  const companionName = character.name;
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [heard, setHeard] = useState("");
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const heardRef = useRef("");
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const phaseRef = useRef<VoicePhase>("idle");
  const micRef = useRef<HTMLButtonElement>(null);
  const onSendRef = useRef(onSend);
  const onCloseRef = useRef(onClose);

  onSendRef.current = onSend;
  onCloseRef.current = onClose;
  phaseRef.current = phase;

  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), []);
  const ttsSupported = useMemo(() => isSpeechSynthesisSupported(), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cancelSpeech = useCallback(() => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const cancelVoice = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    heardRef.current = "";
    try {
      if (recognition?.abort) recognition.abort();
      else recognition?.stop();
    } catch {
      // Browser recognition can throw when already stopped.
    }
    cancelSpeech();
  }, [cancelSpeech]);

  const endCall = useCallback(
    (returnToText: boolean) => {
      busyRef.current = false;
      cancelVoice();
      onCloseRef.current(returnToText);
    },
    [cancelVoice],
  );

  const speakReply = useCallback(
    (text: string) => {
      if (!ttsSupported) {
        busyRef.current = false;
        setPhase("idle");
        setNotice(
          "Speech playback isn’t available in this browser. The reply is shown above as text.",
        );
        return;
      }

      cancelSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.97;
      utterance.pitch = 1.02;
      utterance.onend = () => {
        if (!mountedRef.current || phaseRef.current !== "speaking") return;
        busyRef.current = false;
        setPhase("idle");
      };
      utterance.onerror = () => {
        if (!mountedRef.current || phaseRef.current !== "speaking") return;
        busyRef.current = false;
        setPhase("idle");
        setNotice(
          "Speech playback stopped. The reply is still shown above as text.",
        );
      };
      setPhase("speaking");
      window.speechSynthesis.speak(utterance);
    },
    [cancelSpeech, ttsSupported],
  );

  const deliver = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busyRef.current) return;
      busyRef.current = true;
      setHeard(clean);
      setDraft("");
      setReply("");
      setError("");
      setNotice("");
      setPhase("thinking");

      const outcome = await onSendRef.current(clean);
      if (!mountedRef.current) return;

      if (!outcome.ok) {
        busyRef.current = false;
        setPhase("error");
        setError(outcome.message);
        return;
      }

      setReply(outcome.reply);
      speakReply(outcome.reply);
    },
    [speakReply],
  );

  const startListening = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setPhase("error");
      setError(
        "Speech recognition isn’t available in this browser. You can return to text chat and keep talking there.",
      );
      return;
    }

    cancelVoice();
    setError("");
    setNotice("");
    setHeard("");
    setDraft("");
    setReply("");
    heardRef.current = "";

    try {
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";

      recognition.onresult = (event) => {
        let finalText = "";
        let interim = "";
        const start = event.resultIndex ?? 0;
        for (let index = start; index < event.results.length; index += 1) {
          const alternative = event.results[index]?.[0];
          if (!alternative) continue;
          const isFinal = Boolean(alternative.isFinal);
          if (isFinal) finalText += ` ${alternative.transcript}`;
          else interim += alternative.transcript;
        }
        heardRef.current = finalText.trim();
        setDraft(`${finalText} ${interim}`.trim());
      };

      recognition.onerror = (event) => {
        recognitionRef.current = null;
        busyRef.current = false;
        heardRef.current = "";
        const reason = event.error ?? "";
        if (reason === "aborted") return;
        setPhase("error");
        setError(recognitionErrorMessage(reason));
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        if (!mountedRef.current) return;
        const text = heardRef.current.trim();
        if (text) {
          void deliver(text);
          return;
        }
        setPhase((current) => (current === "error" ? current : "idle"));
      };

      recognitionRef.current = recognition;
      setPhase("listening");
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setPhase("error");
      setError(
        "Microphone capture couldn’t start in this browser. You can try again or return to text chat.",
      );
    }
  }, [cancelVoice, deliver]);

  const toggleMic = () => {
    if (phase === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    if (phase === "thinking") return;
    startListening();
  };

  const stopSpeaking = () => {
    cancelSpeech();
    busyRef.current = false;
    setNotice("Voice stopped. The reply is still shown above.");
    setPhase("idle");
  };

  useEffect(() => {
    if (!open) return;

    setPhase("idle");
    setError("");
    setNotice("");
    setHeard("");
    setDraft("");
    setReply("");
    busyRef.current = false;

    const focusTimer = window.setTimeout(() => micRef.current?.focus(), 40);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") endCall(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      cancelVoice();
    };
  }, [open, cancelVoice, endCall]);

  if (!open) return null;

  const copy = PHASE_COPY[phase];
  const statusLabel =
    phase === "thinking"
      ? `${companionName} is thinking`
      : phase === "speaking"
        ? `${companionName} is speaking`
        : copy.label;
  const lumiState = copy.lumi;
  const transcript = heard || draft;
  const micLabel =
    phase === "listening" ? "Stop listening and send" : "Start voice input";

  return createPortal(
    <div
      className="voice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-title"
    >
      <div className="voice-overlay__card">
        <header className="voice-overlay__head">
          <div>
            <p className="eyebrow">Voice mode</p>
            <h2 id="voice-title">Talk with {companionName}</h2>
          </div>
          <div className="voice-overlay__head-actions">
            <Badge tone={demo ? "brand" : "info"}>
              {demo ? "Demo · sample replies" : "Browser voice"}
            </Badge>
            <button
              type="button"
              className="icon-button"
              onClick={() => endCall(false)}
              aria-label="End voice chat"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </header>

        <div className="voice-overlay__stage">
          <div className={demo ? "voice-aura voice-aura--demo" : "voice-aura"}>
            <CompanionAvatar state={lumiState} size="hero" />
          </div>

          <div className="voice-status" role="status" aria-live="polite">
            <span
              className={`voice-status__dot voice-status__dot--${phase}`}
              aria-hidden="true"
            />
            <strong>{statusLabel}</strong>
            <p>{copy.hint}</p>
          </div>

          {transcript || reply ? (
            <div className="voice-transcript">
              {transcript ? (
                <p className="voice-transcript__line">
                  <span>You</span>
                  {transcript}
                </p>
              ) : null}
              {phase === "thinking" ? (
                <p className="voice-transcript__wait">
                  {companionName} is thinking…
                </p>
              ) : null}
              {reply ? (
                <p className="voice-transcript__line voice-transcript__line--lumi">
                  <span>{companionName}</span>
                  {reply}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="voice-prompt">
              This is a spoken conversation, one turn at a time.{" "}
              {companionName}’s reply is read aloud by your browser, and the
              full exchange is saved in your text chat.
            </p>
          )}

          {!speechSupported ? (
            <Alert tone="warning">
              Speech recognition isn’t available in this browser, so voice input
              can’t start. Return to text chat to keep talking with{" "}
              {companionName}.
            </Alert>
          ) : null}

          {notice ? (
            <p className="voice-notice" role="status">
              {notice}
            </p>
          ) : null}

          {error ? <Alert tone="danger">{error}</Alert> : null}
        </div>

        <div className="voice-controls">
          <div className="voice-controls__primary">
            <button
              ref={micRef}
              type="button"
              className={`voice-mic${
                phase === "listening" ? " voice-mic--listening" : ""
              }`}
              onClick={toggleMic}
              disabled={!speechSupported || phase === "thinking"}
              aria-label={micLabel}
              aria-pressed={phase === "listening"}
            >
              <MicIcon size={26} />
              <span>{phase === "listening" ? "Send" : "Speak"}</span>
            </button>
          </div>

          <div className="voice-controls__secondary">
            <button
              type="button"
              className="voice-control"
              onClick={stopSpeaking}
              disabled={phase !== "speaking"}
            >
              <SpeakerIcon size={16} />
              Stop speaking
            </button>
            <button
              type="button"
              className="voice-control"
              onClick={() => endCall(true)}
            >
              Return to text
            </button>
            <button
              type="button"
              className="voice-control voice-control--quiet"
              onClick={() => endCall(false)}
            >
              End voice chat
            </button>
          </div>
        </div>

        <p className="voice-disclaimer">
          {demo
            ? "Demo mode: replies are scripted samples spoken by your browser. Nothing leaves this browser."
            : "Your browser transcribes one turn at a time and sends it as text to the existing chat service; the reply is spoken locally. This is not live audio streaming and Mindora does not provide the voice itself."}
        </p>
      </div>
    </div>,
    document.body,
  );
}


