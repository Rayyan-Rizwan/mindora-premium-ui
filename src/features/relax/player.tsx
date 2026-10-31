import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AmbientEngine, isAudioSupported } from "./audioEngine";
import type { RelaxTrack } from "./tracks";

interface RelaxPlayerValue {
  supported: boolean;
  track: RelaxTrack | null;
  playing: boolean;
  position: number;
  volume: number;
  error: string;
  started: boolean;
  shuffle: boolean;
  favouriteIds: string[];
  play: (track: RelaxTrack, queue?: RelaxTrack[]) => void;
  select: (track: RelaxTrack, queue?: RelaxTrack[]) => void;
  toggle: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
  seek: (seconds: number) => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  toggleFavourite: (trackId: string) => void;
  isFavourite: (trackId: string) => boolean;
}

const RelaxPlayerContext = createContext<RelaxPlayerValue | null>(null);

function audioErrorMessage(failure: unknown): string {
  if (failure instanceof Error && failure.message) return failure.message;
  return "The browser could not start audio. Try a different browser or tab.";
}

export function RelaxPlayerProvider({ children }: { children: ReactNode }) {
  const [supported] = useState(() => isAudioSupported());
  const [track, setTrack] = useState<RelaxTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolumeState] = useState(0.55);
  const [shuffle, setShuffle] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const engineRef = useRef<AmbientEngine | null>(null);
  const trackRef = useRef<RelaxTrack | null>(null);
  const queueRef = useRef<RelaxTrack[]>([]);
  const startedAtRef = useRef(0);
  const positionRef = useRef(0);
  const volumeRef = useRef(0.55);
  const shuffleRef = useRef(false);

  const pause = useCallback(() => {
    const current = trackRef.current;
    if (current) {
      positionRef.current =
        ((Date.now() - startedAtRef.current) / 1000) % current.duration;
      setPosition(positionRef.current);
    }
    engineRef.current?.stop();
    setPlaying(false);
  }, []);

  const play = useCallback(
    (next: RelaxTrack, nextQueue?: RelaxTrack[]) => {
      if (!supported) {
        setError(
          "This browser does not expose the Web Audio API, so the generated pieces cannot play here. The track list stays visible for reference.",
        );
        return;
      }
      if (nextQueue) queueRef.current = nextQueue;
      try {
        const switching = trackRef.current?.id !== next.id;
        if (switching) {
          engineRef.current?.dispose();
          engineRef.current = null;
          positionRef.current = 0;
          setPosition(0);
          trackRef.current = next;
          setTrack(next);
        }
        if (!engineRef.current) {
          engineRef.current = new AmbientEngine(next.sound, volumeRef.current);
        }
        startedAtRef.current = Date.now() - positionRef.current * 1000;
        setError("");
        setStarted(true);
        setPlaying(true);
        void engineRef.current.start().catch((failure) => {
          setError(audioErrorMessage(failure));
          setPlaying(false);
        });
      } catch (failure) {
        setError(audioErrorMessage(failure));
        setPlaying(false);
      }
    },
    [supported],
  );

  const select = useCallback(
    (next: RelaxTrack, nextQueue?: RelaxTrack[]) => {
      if (nextQueue) queueRef.current = nextQueue;
      if (trackRef.current?.id === next.id) return;
      engineRef.current?.dispose();
      engineRef.current = null;
      trackRef.current = next;
      positionRef.current = 0;
      setTrack(next);
      setPosition(0);
      startedAtRef.current = Date.now();
      setPlaying(false);
    },
    [],
  );

  const toggle = useCallback(() => {
    if (playing) {
      pause();
      return;
    }
    if (trackRef.current) play(trackRef.current);
  }, [playing, pause, play]);

  const stop = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
    trackRef.current = null;
    queueRef.current = [];
    positionRef.current = 0;
    startedAtRef.current = Date.now();
    setTrack(null);
    setPlaying(false);
    setStarted(false);
    setPosition(0);
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    engineRef.current?.setVolume(clamped);
  }, []);

  const seek = useCallback((seconds: number) => {
    const current = trackRef.current;
    if (!current) return;
    const clamped = Math.min(current.duration, Math.max(0, seconds));
    positionRef.current = clamped;
    startedAtRef.current = Date.now() - clamped * 1000;
    setPosition(clamped);
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      const list = queueRef.current;
      if (!list.length) return;
      const current = trackRef.current;
      const index = current
        ? list.findIndex((item) => item.id === current.id)
        : -1;
      let target: RelaxTrack | undefined;

      if (shuffleRef.current && list.length > 1) {
        const alternatives = list.filter((item) => item.id !== current?.id);
        target = alternatives[Math.floor(Math.random() * alternatives.length)];
      } else {
        const nextIndex =
          index < 0 ? 0 : (index + direction + list.length) % list.length;
        target = list[nextIndex];
      }

      if (!target) return;
      if (playing) {
        play(target);
      } else {
        select(target);
      }
    },
    [playing, play, select],
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => {
      shuffleRef.current = !value;
      return !value;
    });
  }, []);

  const toggleFavourite = useCallback((trackId: string) => {
    setFavouriteIds((ids) =>
      ids.includes(trackId)
        ? ids.filter((id) => id !== trackId)
        : [...ids, trackId],
    );
  }, []);

  const isFavourite = useCallback(
    (trackId: string) => favouriteIds.includes(trackId),
    [favouriteIds],
  );

  useEffect(() => {
    if (!playing || !track) return;
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      positionRef.current = elapsed % track.duration;
      setPosition(positionRef.current);
    }, 500);
    return () => window.clearInterval(timer);
  }, [playing, track]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
    },
    [],
  );

  const value = useMemo<RelaxPlayerValue>(
    () => ({
      supported,
      track,
      playing,
      position,
      volume,
      error,
      started,
      shuffle,
      favouriteIds,
      play,
      select,
      toggle,
      pause,
      stop,
      setVolume,
      seek,
      next,
      previous,
      toggleShuffle,
      toggleFavourite,
      isFavourite,
    }),
    [
      supported,
      track,
      playing,
      position,
      volume,
      error,
      started,
      shuffle,
      favouriteIds,
      play,
      select,
      toggle,
      pause,
      stop,
      setVolume,
      seek,
      next,
      previous,
      toggleShuffle,
      toggleFavourite,
      isFavourite,
    ],
  );

  return (
    <RelaxPlayerContext.Provider value={value}>
      {children}
    </RelaxPlayerContext.Provider>
  );
}

export function useRelaxPlayer(): RelaxPlayerValue {
  const value = useContext(RelaxPlayerContext);
  if (!value) {
    throw new Error("useRelaxPlayer must be used inside RelaxPlayerProvider.");
  }
  return value;
}
