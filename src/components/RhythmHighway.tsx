import React, { useCallback, useEffect, useRef } from 'react';
import {
  DIFFICULTIES,
  DifficultyId,
  HIT_WINDOWS_SEC,
  LANES,
} from '../config/songs';
import { ChartNote, LaneIndex } from '../utils/chartGenerator';
import { playHitSound } from '../utils/soundFx';
import { PlayerPlaybackState } from '../hooks/useYouTubePlayer';

export interface LiveScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  perfect: number;
  good: number;
  okay: number;
  miss: number;
  lastJudgement: 'perfect' | 'good' | 'okay' | 'miss' | null;
}

interface FloatingFeedback {
  id: number;
  text: string;
  color: string;
  lane: LaneIndex;
  createdAt: number;
}

interface HitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface RhythmHighwayProps {
  notes: ChartNote[];
  resetToken: number;
  difficulty: DifficultyId;
  bpm: number;
  offsetSec: number;
  playbackState: PlayerPlaybackState;
  isGatewayLocked: boolean;
  sfxEnabled: boolean;
  getCurrentTime: () => number;
  onScoreChange: (state: LiveScoreState) => void;
  onTogglePlay: () => void;
}

const KEY_TO_LANE: Record<string, LaneIndex> = {
  ArrowLeft: 0,
  ArrowDown: 1,
  ArrowUp: 2,
  ArrowRight: 3,
};

function drawArrowGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  lane: LaneIndex,
  size: number,
  fill: string,
  stroke: string,
  lineWidth = 2
) {
  ctx.save();
  ctx.translate(cx, cy);
  // Base arrow points RIGHT (0 rad). Rotate per lane: Left=PI, Down=PI/2, Up=-PI/2, Right=0
  const rotations: Record<LaneIndex, number> = {
    0: Math.PI,
    1: Math.PI / 2,
    2: -Math.PI / 2,
    3: 0,
  };
  ctx.rotate(rotations[lane]);

  const s = size;
  ctx.beginPath();
  ctx.moveTo(s * 0.55, 0);
  ctx.lineTo(-s * 0.05, -s * 0.52);
  ctx.lineTo(-s * 0.05, -s * 0.22);
  ctx.lineTo(-s * 0.52, -s * 0.22);
  ctx.lineTo(-s * 0.52, s * 0.22);
  ctx.lineTo(-s * 0.05, s * 0.22);
  ctx.lineTo(-s * 0.05, s * 0.52);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

export const RhythmHighway: React.FC<RhythmHighwayProps> = ({
  notes,
  resetToken,
  difficulty,
  bpm,
  offsetSec,
  playbackState,
  isGatewayLocked,
  sfxEnabled,
  getCurrentTime,
  onScoreChange,
  onTogglePlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const notesRef = useRef<ChartNote[]>([]);
  const pressedLanesRef = useRef<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);
  const receptorPulseRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);
  const feedbacksRef = useRef<FloatingFeedback[]>([]);
  const particlesRef = useRef<HitParticle[]>([]);
  const feedbackIdRef = useRef(1);

  const scoreStateRef = useRef<LiveScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfect: 0,
    good: 0,
    okay: 0,
    miss: 0,
    lastJudgement: null,
  });

  // Smooth audio-clock tracking locked to player.getCurrentTime()
  const smoothTimeRef = useRef<number>(0);
  const lastFrameTsRef = useRef<number>(performance.now());

  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const offsetRef = useRef(offsetSec);
  offsetRef.current = offsetSec;
  const playbackStateRef = useRef(playbackState);
  playbackStateRef.current = playbackState;
  const sfxRef = useRef(sfxEnabled);
  sfxRef.current = sfxEnabled;
  const isLockedRef = useRef(isGatewayLocked);
  isLockedRef.current = isGatewayLocked;

  // Reset chart notes & live score whenever track/difficulty/resetToken changes
  useEffect(() => {
    notesRef.current = notes.map((n) => ({ ...n, hit: false, missed: false }));
    feedbacksRef.current = [];
    particlesRef.current = [];
    smoothTimeRef.current = getCurrentTime();
    const initial: LiveScoreState = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      perfect: 0,
      good: 0,
      okay: 0,
      miss: 0,
      lastJudgement: null,
    };
    scoreStateRef.current = initial;
    onScoreChange(initial);
  }, [notes, resetToken, getCurrentTime, onScoreChange]);

  const registerJudgement = useCallback(
    (judgement: 'perfect' | 'good' | 'okay' | 'miss', lane: LaneIndex) => {
      const prev = scoreStateRef.current;
      let nextCombo = prev.combo;
      let points = 0;

      if (judgement === 'miss') {
        nextCombo = 0;
      } else {
        nextCombo = prev.combo + 1;
      }

      const multiplier =
        nextCombo >= 30 ? 4 : nextCombo >= 20 ? 3 : nextCombo >= 10 ? 2 : 1;

      if (judgement === 'perfect') points = 300 * multiplier;
      else if (judgement === 'good') points = 150 * multiplier;
      else if (judgement === 'okay') points = 50 * multiplier;

      const updated: LiveScoreState = {
        score: prev.score + points,
        combo: nextCombo,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
        multiplier,
        perfect: prev.perfect + (judgement === 'perfect' ? 1 : 0),
        good: prev.good + (judgement === 'good' ? 1 : 0),
        okay: prev.okay + (judgement === 'okay' ? 1 : 0),
        miss: prev.miss + (judgement === 'miss' ? 1 : 0),
        lastJudgement: judgement,
      };
      scoreStateRef.current = updated;
      onScoreChange(updated);

      const labelMap = {
        perfect: 'PERFECT!',
        good: 'GOOD',
        okay: 'OKAY',
        miss: 'MISS',
      };
      const colorMap = {
        perfect: '#FACC15',
        good: '#22D3EE',
        okay: '#34D399',
        miss: '#FB7185',
      };

      feedbacksRef.current.push({
        id: feedbackIdRef.current++,
        text: labelMap[judgement],
        color: colorMap[judgement],
        lane,
        createdAt: performance.now(),
      });
      if (feedbacksRef.current.length > 10) {
        feedbacksRef.current.shift();
      }

      playHitSound(judgement, sfxRef.current);

      // Spawn burst particles on hit
      if (judgement !== 'miss' && canvasRef.current) {
        const w = canvasRef.current.width / (window.devicePixelRatio || 1);
        const h = canvasRef.current.height / (window.devicePixelRatio || 1);
        const laneW = w / 4;
        const cx = laneW * lane + laneW / 2;
        const hitY = h - 82;
        const laneColor = LANES[lane].color;

        const count = judgement === 'perfect' ? 12 : 7;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
          const speed = 1.6 + Math.random() * 3.2;
          particlesRef.current.push({
            x: cx,
            y: hitY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.9,
            radius: judgement === 'perfect' ? 3.2 : 2.4,
            color: judgement === 'perfect' ? '#FDE047' : laneColor,
            alpha: 1,
          });
        }
      }
    },
    [onScoreChange]
  );

  const handleLaneHit = useCallback(
    (lane: LaneIndex) => {
      receptorPulseRef.current[lane] = 1;
      if (playbackStateRef.current !== 'playing' || isLockedRef.current) return;

      const currentSec = smoothTimeRef.current;
      let bestNote: ChartNote | null = null;
      let bestDelta = Infinity;

      for (const note of notesRef.current) {
        if (note.hit || note.missed || note.lane !== lane) continue;
        const delta = Math.abs(note.timeSec - currentSec);
        if (delta <= HIT_WINDOWS_SEC.miss && delta < bestDelta) {
          bestDelta = delta;
          bestNote = note;
        }
        // Notes are sorted by timeSec; stop searching well ahead
        if (note.timeSec - currentSec > HIT_WINDOWS_SEC.miss + 0.1) break;
      }

      if (!bestNote) return;

      if (bestDelta <= HIT_WINDOWS_SEC.perfect) {
        bestNote.hit = true;
        registerJudgement('perfect', lane);
      } else if (bestDelta <= HIT_WINDOWS_SEC.good) {
        bestNote.hit = true;
        registerJudgement('good', lane);
      } else if (bestDelta <= HIT_WINDOWS_SEC.okay) {
        bestNote.hit = true;
        registerJudgement('okay', lane);
      } else {
        bestNote.missed = true;
        registerJudgement('miss', lane);
      }
    },
    [registerJudgement]
  );

  // Keyboard listener with e.preventDefault() on arrow keys so page never scrolls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key in KEY_TO_LANE) {
        // Always prevent arrow keys from scrolling the page during gameplay/menu
        if (!isInputFocused) {
          e.preventDefault();
        }
        if (e.repeat || isInputFocused || isLockedRef.current) return;
        const lane = KEY_TO_LANE[e.key];
        pressedLanesRef.current[lane] = true;
        handleLaneHit(lane);
      } else if (e.code === 'Space' && !isInputFocused && !isLockedRef.current) {
        e.preventDefault();
        if (!e.repeat) {
          onTogglePlay();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key in KEY_TO_LANE) {
        const lane = KEY_TO_LANE[e.key];
        pressedLanesRef.current[lane] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleLaneHit, onTogglePlay]);

  // Main 60fps requestAnimationFrame render + audio-sync loop
  useEffect(() => {
    let rafId = 0;

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastFrameTsRef.current) / 1000));
      lastFrameTsRef.current = now;

      // Sync local smooth audio clock to YouTube's player.getCurrentTime()
      const ytTime = getCurrentTime();
      if (playbackStateRef.current === 'playing') {
        smoothTimeRef.current += dt;
        const drift = ytTime - smoothTimeRef.current;
        if (Math.abs(drift) > 0.14) {
          // Resync immediately on seek or buffer jump
          smoothTimeRef.current = ytTime;
        } else if (Math.abs(drift) > 0.015) {
          // Gentle phase lock to prevent any drift
          smoothTimeRef.current += drift * 0.18;
        }
      } else {
        smoothTimeRef.current = ytTime;
      }

      const currentSec = smoothTimeRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        const ctx = canvas.getContext('2d');
        if (ctx && rect.width > 0 && rect.height > 0) {
          ctx.save();
          ctx.scale(dpr, dpr);

          const W = rect.width;
          const H = rect.height;
          const laneW = W / 4;
          const hitZoneY = H - 82;
          const scrollSpeed = DIFFICULTIES[difficultyRef.current].scrollSpeedPx;

          // 1. Background stage gradient
          const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
          bgGrad.addColorStop(0, '#0B0C13');
          bgGrad.addColorStop(0.75, '#111422');
          bgGrad.addColorStop(1, '#16192B');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          // 2. Lane key-press glow beams & subtle dividers
          for (let i = 0; i < 4; i++) {
            const lx = i * laneW;
            const laneCfg = LANES[i];

            if (pressedLanesRef.current[i]) {
              const beam = ctx.createLinearGradient(0, hitZoneY - 260, 0, hitZoneY + 35);
              beam.addColorStop(0, 'rgba(0,0,0,0)');
              beam.addColorStop(1, laneCfg.glow.replace('0.45', '0.26'));
              ctx.fillStyle = beam;
              ctx.fillRect(lx, hitZoneY - 260, laneW, 295);
            }

            if (i > 0) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(lx, 0);
              ctx.lineTo(lx, H);
              ctx.stroke();
            }
          }

          // 3. BPM Beat Grid lines
          const secPerBeat = 60 / Math.max(60, bpmRef.current);
          const visibleSecAhead = (hitZoneY + 40) / scrollSpeed;
          const visibleSecBehind = (H - hitZoneY + 30) / scrollSpeed;
          const minBeat = Math.floor((currentSec - offsetRef.current - visibleSecBehind) / secPerBeat);
          const maxBeat = Math.ceil((currentSec - offsetRef.current + visibleSecAhead) / secPerBeat);

          for (let b = minBeat; b <= maxBeat; b++) {
            const beatTime = b * secPerBeat + offsetRef.current;
            const y = hitZoneY - (beatTime - currentSec) * scrollSpeed;
            if (y < -10 || y > H + 10) continue;
            const isMeasure = b % 4 === 0;
            ctx.strokeStyle = isMeasure
              ? 'rgba(255, 255, 255, 0.13)'
              : 'rgba(255, 255, 255, 0.045)';
            ctx.lineWidth = isMeasure ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
          }

          // 4. Hit Zone Target Line & Lane Receptors
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(0, hitZoneY - 26, W, 52);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, hitZoneY);
          ctx.lineTo(W, hitZoneY);
          ctx.stroke();

          for (let i = 0; i < 4; i++) {
            const cx = i * laneW + laneW / 2;
            const laneCfg = LANES[i];
            const isPressed = pressedLanesRef.current[i];
            receptorPulseRef.current[i] = Math.max(0, receptorPulseRef.current[i] - dt * 5.5);
            const scale = 1 + receptorPulseRef.current[i] * 0.14 - (isPressed ? 0.06 : 0);

            ctx.save();
            ctx.translate(cx, hitZoneY);
            ctx.scale(scale, scale);

            // Outer receptor ring
            ctx.beginPath();
            ctx.arc(0, 0, 27, 0, Math.PI * 2);
            ctx.fillStyle = isPressed ? laneCfg.glow : 'rgba(15, 18, 28, 0.85)';
            ctx.fill();
            ctx.lineWidth = isPressed ? 3 : 2;
            ctx.strokeStyle = isPressed ? laneCfg.color : 'rgba(255, 255, 255, 0.24)';
            ctx.stroke();

            drawArrowGlyph(
              ctx,
              0,
              0,
              i as LaneIndex,
              25,
              isPressed ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
              isPressed ? laneCfg.color : 'rgba(255,255,255,0.45)',
              1.6
            );
            ctx.restore();

            // Keycap hint below receptor
            ctx.fillStyle = isPressed ? laneCfg.color : 'rgba(148, 163, 184, 0.72)';
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(laneCfg.symbol, cx, hitZoneY + 46);
          }

          // 5. Check missed notes & draw active falling notes
          for (const note of notesRef.current) {
            if (note.hit || note.missed) continue;

            // Detect passed notes beyond Okay window when playing
            if (
              playbackStateRef.current === 'playing' &&
              currentSec - note.timeSec > HIT_WINDOWS_SEC.okay
            ) {
              note.missed = true;
              registerJudgement('miss', note.lane);
              continue;
            }

            const y = hitZoneY - (note.timeSec - currentSec) * scrollSpeed;
            if (y < -40 || y > H + 40) continue;

            const cx = note.lane * laneW + laneW / 2;
            const laneCfg = LANES[note.lane];

            // Note glow halo
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, y, 25, 0, Math.PI * 2);
            ctx.fillStyle = laneCfg.glow.replace('0.45', '0.22');
            ctx.fill();

            // Note disc
            ctx.beginPath();
            ctx.arc(cx, y, 21, 0, Math.PI * 2);
            ctx.fillStyle = '#0F121D';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = laneCfg.color;
            ctx.stroke();

            // Directional arrow
            drawArrowGlyph(ctx, cx, y, note.lane, 24, laneCfg.color, '#FFFFFF', 1.4);
            ctx.restore();
          }

          // 6. Hit burst particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= dt * 2.8;
            if (p.alpha <= 0) {
              particlesRef.current.splice(i, 1);
              continue;
            }
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 7. Floating judgement text ("PERFECT!", "GOOD", "MISS")
          for (let i = feedbacksRef.current.length - 1; i >= 0; i--) {
            const fb = feedbacksRef.current[i];
            const ageSec = (now - fb.createdAt) / 1000;
            if (ageSec > 0.65) {
              feedbacksRef.current.splice(i, 1);
              continue;
            }
            const alpha = Math.max(0, 1 - ageSec / 0.65);
            const riseY = hitZoneY - 54 - ageSec * 44;
            const fx = fb.lane * laneW + laneW / 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = '800 15px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#09090E';
            ctx.fillText(fb.text, fx + 1, riseY + 1);
            ctx.fillStyle = fb.color;
            ctx.fillText(fb.text, fx, riseY);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [getCurrentTime, registerJudgement]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const lane = Math.min(3, Math.max(0, Math.floor((relX / rect.width) * 4))) as LaneIndex;
    pressedLanesRef.current[lane] = true;
    handleLaneHit(lane);
  };

  const handleCanvasPointerUp = () => {
    pressedLanesRef.current = [false, false, false, false];
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={handleCanvasPointerUp}
        className="w-full h-full block rounded-xl border border-slate-800/90 shadow-2xl cursor-pointer touch-none"
        aria-label="4-lane arrow key rhythm highway"
      />

      {/* Non-playing Overlay Prompt */}
      {playbackState !== 'playing' && !isGatewayLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090E]/65 backdrop-blur-[2px] rounded-xl pointer-events-none">
          <div className="text-center px-6 py-5 rounded-xl border border-slate-700/80 bg-[#12141F]/95 shadow-xl pointer-events-auto max-w-xs">
            <p className="font-display text-lg font-bold text-slate-100">
              {playbackState === 'loading'
                ? 'Connecting Playlist...'
                : playbackState === 'paused'
                ? 'Track Paused'
                : playbackState === 'buffering'
                ? 'Buffering Video...'
                : 'Ready to Play'}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Use keyboard arrows <span className="font-mono text-slate-200">← ↓ ↑ →</span> as
              notes cross the bottom Hit Zone.
            </p>
            {playbackState !== 'loading' && (
              <button
                type="button"
                onClick={onTogglePlay}
                className="mt-4 w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap"
              >
                {playbackState === 'paused' ? 'Resume Track (Space)' : 'Start Track (Space)'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
