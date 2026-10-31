import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert } from "@/components/ui";
import {
  ArrowLeftIcon,
  HeadphonesIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerIcon,
} from "@/components/ui/icons";
import { classNames } from "@/lib/utils";
import { useRelaxPlayer } from "./player";
import { TrackArtwork } from "./RelaxArt";
import { TrackVisual } from "./SessionArt";
import {
  OCEAN_WAVES,
  SOUND_TABS,
  findMindfulTrack,
  mindfulTracksFor,
  toRelaxTrack,
  trackDurationLabel,
  type SoundTab,
} from "./sessions";
import { CATEGORY_LABEL, RELAX_TRACKS, formatDuration } from "./tracks";

export default function MindfulSoundsPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<SoundTab>("all");
  const {
    track,
    playing,
    position,
    volume,
    supported,
    error,
    shuffle,
    play,
    pause,
    select,
    toggle,
    seek,
    next,
    previous,
    setVolume,
    toggleShuffle,
    toggleFavourite,
    isFavourite,
  } = useRelaxPlayer();

  const allQueue = useMemo(() => mindfulTracksFor("all"), []);
  const ocean = useMemo(() => toRelaxTrack(OCEAN_WAVES), []);
  const list = useMemo(() => mindfulTracksFor(tab), [tab]);

  const requested = params.get("track");
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    const key = requested ?? "";
    if (appliedRef.current === key) return;
    appliedRef.current = key;
    const found = findMindfulTrack(requested);
    if (found) {
      select(found, allQueue);
      return;
    }
    if (!track) select(ocean, allQueue);
  }, [requested, select, allQueue, ocean, track]);

  const hero = track ?? ocean;
  const percent = Math.min(100, (position / hero.duration) * 100);
  const favourite = isFavourite(hero.id);
  const ordered = useMemo(() => {
    if (!track) return list;
    return [...list].sort(
      (a, b) => Number(b.id === track.id) - Number(a.id === track.id),
    );
  }, [list, track]);

  return (
    <div className="rx-screen ms-screen">
      <header className="rx-head">
        <Link to="/relax" className="rx-back" aria-label="Back to Relax">
          <ArrowLeftIcon size={19} />
        </Link>
        <div className="rx-head__title">
          <h1>Listen</h1>
          <p>Mindful sounds for rest and focus.</p>
        </div>
        <span className="rx-head__spark" aria-hidden="true">
          <HeartIcon size={18} />
        </span>
      </header>

      <div className="rx-filters" role="tablist" aria-label="Sound categories">
        {SOUND_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            className="rx-filter"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <Alert tone="warning">{error}</Alert> : null}

      <div className="ms-hero">
        <TrackVisual track={hero} className="ms-hero__art" />
        <span className="ms-hero__shade" aria-hidden="true" />
        <div className="ms-hero__copy">
          <h2>{hero.title}</h2>
          <p>
            {CATEGORY_LABEL[hero.category]} · {trackDurationLabel(hero)}
          </p>
        </div>
      </div>

      <div className="ms-seek">
        <input
          type="range"
          min={0}
          max={Math.round(hero.duration)}
          step={1}
          value={Math.round(position)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="Playback position"
          style={
            {
              "--seek-fill": `${percent}%`,
            } as CSSProperties
          }
        />
        <div className="ms-seek__time">
          <span>{formatDuration(position)}</span>
          <span>{formatDuration(hero.duration)}</span>
        </div>
      </div>

      <div className="ms-controls">
        <button
          type="button"
          className={classNames("ms-control", shuffle && "ms-control--on")}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={toggleShuffle}
        >
          <ShuffleIcon size={19} />
        </button>
        <button
          type="button"
          className="ms-control"
          aria-label="Previous track"
          onClick={previous}
        >
          <SkipBackIcon size={22} />
        </button>
        <button
          type="button"
          className="ms-play"
          aria-label={playing ? "Pause" : `Play ${hero.title}`}
          onClick={() => (playing ? pause() : play(hero, list))}
        >
          {playing ? <PauseIcon size={28} /> : <PlayIcon size={27} />}
        </button>
        <button
          type="button"
          className="ms-control"
          aria-label="Next track"
          onClick={next}
        >
          <SkipForwardIcon size={22} />
        </button>
        <button
          type="button"
          className={classNames(
            "ms-control",
            favourite && "ms-control--favourite",
          )}
          aria-label={
            favourite ? "Remove from favourites" : "Add to favourites"
          }
          aria-pressed={favourite}
          onClick={() => toggleFavourite(hero.id)}
        >
          <HeartIcon size={20} />
        </button>
      </div>

      <div className="ms-volume">
        <SpeakerIcon size={18} />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
          aria-label="Volume"
        />
        <span className="ms-volume__device" aria-hidden="true">
          <HeadphonesIcon size={19} />
        </span>
      </div>

      <section className="ms-next" aria-label="Next up">
        <h2>Next Up</h2>
        <div className="ms-next__list">
          {ordered.map((item) => {
            const active = track?.id === item.id;
            const itemPlaying = active && playing;
            return (
              <button
                key={item.id}
                type="button"
                className={classNames("ms-row", active && "ms-row--active")}
                onClick={() => {
                  if (!active) {
                    play(item, list);
                  } else if (playing) {
                    pause();
                  } else {
                    play(item, list);
                  }
                }}
                aria-label={
                  itemPlaying ? `Pause ${item.title}` : `Play ${item.title}`
                }
              >
                <span className="ms-row__art" aria-hidden="true">
                  <TrackVisual track={item} />
                </span>
                <span className="ms-row__copy">
                  <strong>{item.title}</strong>
                  <span>
                    {CATEGORY_LABEL[item.category]} ·{" "}
                    {trackDurationLabel(item)}
                  </span>
                  {active ? (
                    <span className="ms-row__progress" aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </span>
                  ) : null}
                </span>
                <span className="ms-row__button" aria-hidden="true">
                  {itemPlaying ? (
                    <PauseIcon size={15} />
                  ) : (
                    <PlayIcon size={14} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relax-library" aria-label="Your generated library">
        <div className="relax-library__head">
          <h2>Your generated library</h2>
          <span>
            {RELAX_TRACKS.length} pieces ·{" "}
            {supported
              ? "generated on your device"
              : "non-playable in this browser"}
          </span>
        </div>

        <div className="relax-list">
          {RELAX_TRACKS.map((item) => {
            const active = track?.id === item.id;
            const itemPlaying = active && playing;
            const itemPercent = active
              ? Math.min(100, (position / item.duration) * 100)
              : 0;
            return (
              <article
                key={item.id}
                className={classNames(
                  "relax-row",
                  active && "relax-row--active",
                )}
              >
                <span className="relax-row__art" aria-hidden="true">
                  <TrackArtwork track={item} className="relax-row__art-svg" />
                </span>
                <div className="relax-row__copy">
                  <h3>{item.title}</h3>
                  <span>
                    {trackDurationLabel(item)} · {CATEGORY_LABEL[item.category]}
                    {active
                      ? ` · ${itemPlaying ? "playing" : "paused"}`
                      : ""}
                  </span>
                  {active ? (
                    <span className="relax-row__progress">
                      <span style={{ width: `${itemPercent}%` }} />
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="relax-row__play"
                  onClick={() =>
                    active ? toggle() : play(item, RELAX_TRACKS)
                  }
                  disabled={!supported}
                  aria-label={
                    !supported
                      ? "Audio unavailable"
                      : `${itemPlaying ? "Pause" : "Play"} ${item.title}`
                  }
                >
                  {itemPlaying ? (
                    <PauseIcon size={16} />
                  ) : (
                    <PlayIcon size={15} />
                  )}
                </button>
              </article>
            );
          })}
        </div>

        <p className="relax-honesty">
          A guided breathing circle and original ambient textures, generated
          live in this browser. Nothing is streamed or downloaded, and nothing
          here is presented as treatment.
        </p>
      </section>

      <p className="rx-safety">
        These pieces are generated live in this browser from original tones and
        noise. Nothing is streamed, downloaded, or presented as treatment.
      </p>
    </div>
  );
}
