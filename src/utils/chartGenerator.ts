import { DIFFICULTIES, DifficultyId } from '../config/songs';

export type LaneIndex = 0 | 1 | 2 | 3;

export interface ChartNote {
  id: number;
  timeSec: number; // Exact song timestamp in seconds when note reaches Hit Zone
  lane: LaneIndex;
  hit: boolean;
  missed: boolean;
}

/**
 * Deterministic PRNG (Mulberry32) so each (videoId + difficulty + bpm)
 * produces a consistent, learnable chart.
 */
function createRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates rhythmic arrow patterns aligned to BPM and duration.
 */
export function generateChart({
  videoId,
  durationSec,
  bpm,
  difficulty,
  offsetSec = 0,
}: {
  videoId: string;
  durationSec: number;
  bpm: number;
  difficulty: DifficultyId;
  offsetSec?: number;
}): ChartNote[] {
  const safeDuration = Math.max(30, durationSec || 180);
  const safeBpm = Math.max(60, Math.min(220, bpm || 120));
  const config = DIFFICULTIES[difficulty];
  const secPerBeat = 60 / safeBpm;
  const stepSec = secPerBeat * config.subdivisionBeats;

  const rng = createRng(`${videoId}:${difficulty}:${safeBpm}`);
  const notes: ChartNote[] = [];

  // Give player ~2.0 seconds lead-in before first note hits
  const startBeat = Math.ceil(2.0 / stepSec);
  const endTimeSec = Math.max(10, safeDuration - 1.5);
  const totalSteps = Math.floor(endTimeSec / stepSec);

  let noteId = 1;
  let lastLane: LaneIndex = Math.floor(rng() * 4) as LaneIndex;
  let streakRunRemaining = 0;
  let runDirection = 1;

  for (let step = startBeat; step < totalSteps; step++) {
    const timeSec = step * stepSec + offsetSec;
    if (timeSec < 1.5 || timeSec > endTimeSec) continue;

    // Position within 4-beat measure (in 16th-note units for musical phrasing)
    const beatPos = (step * config.subdivisionBeats) % 4;
    const isDownbeat = Math.abs(beatPos % 1) < 0.001;
    const isEighth = Math.abs((beatPos * 2) % 1) < 0.001;

    let spawn = false;

    if (difficulty === 'easy') {
      // Sparse quarter notes on beats with breathing room
      if (isDownbeat) {
        const isMeasureStart = Math.abs(beatPos) < 0.001;
        spawn = isMeasureStart || rng() < config.density;
      }
    } else if (difficulty === 'medium') {
      // Steady quarter notes with occasional light eighth-note step
      if (isDownbeat) {
        spawn = rng() < 0.78;
      } else if (isEighth) {
        spawn = rng() < 0.22;
      }
    } else if (difficulty === 'hard') {
      // Brisk eighth-note rhythms & occasional back-to-back runs
      if (streakRunRemaining > 0) {
        spawn = true;
        streakRunRemaining--;
      } else if (isDownbeat) {
        spawn = rng() < 0.88;
        if (rng() < 0.1) {
          streakRunRemaining = 1 + Math.floor(rng() * 2); // 2-3 eighth-note run
          runDirection = rng() < 0.5 ? 1 : -1;
        }
      } else if (isEighth) {
        spawn = rng() < 0.5;
      }
    } else {
      // Expert (matched to previous Hard complexity + occasional light chord)
      if (streakRunRemaining > 0) {
        spawn = true;
        streakRunRemaining--;
      } else if (isDownbeat) {
        spawn = rng() < 0.9;
        if (rng() < 0.16) {
          streakRunRemaining = 2 + Math.floor(rng() * 2); // 3-4 note rapid burst
          runDirection = rng() < 0.5 ? 1 : -1;
        }
      } else if (isEighth) {
        spawn = rng() < 0.56;
      } else {
        spawn = rng() < 0.18;
      }
    }

    if (!spawn) continue;

    // Choose musical lane progression
    let nextLane: LaneIndex;
    if (streakRunRemaining > 0) {
      nextLane = (((lastLane + runDirection) % 4 + 4) % 4) as LaneIndex;
    } else if (difficulty === 'easy' || difficulty === 'medium') {
      // Avoid repeating same lane too often on easier difficulties
      const candidates = ([0, 1, 2, 3] as LaneIndex[]).filter((l) => l !== lastLane);
      nextLane = candidates[Math.floor(rng() * candidates.length)];
    } else {
      // Allow quick jack notes occasionally in Hard/Expert
      if (rng() < 0.18) {
        nextLane = lastLane;
      } else {
        const candidates = ([0, 1, 2, 3] as LaneIndex[]).filter((l) => l !== lastLane);
        nextLane = candidates[Math.floor(rng() * candidates.length)];
      }
    }

    notes.push({
      id: noteId++,
      timeSec,
      lane: nextLane,
      hit: false,
      missed: false,
    });

    // Simultaneous double-arrow chords in Expert mode (usually on downbeats/accents)
    if (config.allowChords && (isDownbeat || isEighth) && rng() < config.chordChance) {
      const chordChoices = ([0, 1, 2, 3] as LaneIndex[]).filter((l) => l !== nextLane);
      const secondLane = chordChoices[Math.floor(rng() * chordChoices.length)];
      notes.push({
        id: noteId++,
        timeSec,
        lane: secondLane,
        hit: false,
        missed: false,
      });
    }

    lastLane = nextLane;
  }

  return notes;
}
