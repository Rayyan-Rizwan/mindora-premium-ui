import { Link, useLocation } from "react-router-dom";
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  StopIcon,
} from "@/components/ui/icons";
import { useRelaxPlayer } from "./player";
import { TrackVisual } from "./SessionArt";
import { CATEGORY_LABEL, formatDuration } from "./tracks";

export function RelaxMiniPlayer() {
  const { pathname } = useLocation();
  const {
    track,
    playing,
    position,
    supported,
    started,
    error,
    toggle,
    stop,
    previous,
  } = useRelaxPlayer();

  const onPlayer =
    pathname.startsWith("/listen") || pathname.startsWith("/relax/player");
  const onBreathing = pathname.startsWith("/relax/breathing");
  const onRelax = pathname === "/relax";

  if (!track || onPlayer || onBreathing) return null;
  if (!onRelax && !started) return null;

  const percent = Math.min(100, (position / track.duration) * 100);

  return (
    <aside className="relax-mini" aria-label="Now playing">
      <span className="relax-mini__art" aria-hidden="true">
        <TrackVisual track={track} className="relax-mini__art-svg" />
      </span>
      <div className="relax-mini__body">
        <div className="relax-mini__top">
          <div className="relax-mini__title">
            <strong>{track.title}</strong>
            <span>
              {CATEGORY_LABEL[track.category]} ·{" "}
              {formatDuration(position)} / {formatDuration(track.duration)}
            </span>
          </div>
          <div className="relax-mini__controls">
            <button
              type="button"
              className="relax-mini__button relax-mini__button--quiet"
              onClick={previous}
              aria-label="Previous track"
            >
              <SkipBackIcon size={15} />
            </button>
            <button
              type="button"
              className="relax-mini__button relax-mini__button--main"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Resume"}
              disabled={!supported}
            >
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>
            <button
              type="button"
              className="relax-mini__button relax-mini__button--quiet"
              onClick={stop}
              aria-label="Stop and close the player"
            >
              <StopIcon size={13} />
            </button>
          </div>
        </div>
        <div
          className="relax-mini__progress"
          role="progressbar"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(track.duration)}
          aria-valuenow={Math.round(position)}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="relax-mini__bottom">
          <span className="relax-mini__time">
            {formatDuration(position)} / {formatDuration(track.duration)}
          </span>
          <Link
            to={`/listen?track=${track.id}`}
            className="relax-mini__link"
          >
            Open
          </Link>
        </div>
        {error ? <p className="relax-mini__error">{error}</p> : null}
      </div>
    </aside>
  );
}
