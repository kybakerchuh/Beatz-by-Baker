/**
 * YouTube Playlist & Song Override Configuration
 * ---------------------------------------------------------------------------
 * Primary playlist loaded via the official YouTube IFrame Player API:
 *   Playlist ID: PLO7-VO1D0_6NqQTF1PDqVuSRs70XniNDq
 */

export const YOUTUBE_PLAYLIST_ID = 'PLPapa6Y6Gxyw';

export const PLAYLIST_OPTIONS = [
  { id: 'PLPapa6Y6Gxyw', label: 'Featured OST Mix' },
  { id: 'PLO7-VO1D0_6NqQTF1PDqVuSRs70XniNDq', label: 'Classic Arcade Mix' },
] as const;

/** First 5 songs (indices 0–4) are unlocked at start; tracks 6+ require solving an OST question. */
export const INITIAL_UNLOCKED_SONGS = 5;

export interface CustomSongOverride {
  /** Match by playlist track index (0-based) */
  index?: number;
  /** Or match by exact YouTube 11-character videoId */
  videoId?: string;
  /** Optional custom display title */
  title?: string;
  /** Exact BPM override for note chart generation */
  bpm: number;
  /** Optional beat offset in seconds (positive delays notes, negative advances) */
  offsetSec?: number;
}

/**
 * CUSTOM_SONGS
 * ---------------------------------------------------------------------------
 * Add entries below to override specific tracks from your YouTube playlist
 * with exact BPMs, custom titles, or beat-sync offsets.
 *
 * Example:
 *   { index: 0, title: "Opening Theme", bpm: 128, offsetSec: 0.15 },
 *   { videoId: "dQw4w9WgXcQ", bpm: 113 },
 */
export const CUSTOM_SONGS: CustomSongOverride[] = [
  { index: 0, bpm: 118, offsetSec: 0 },
  { index: 1, bpm: 124, offsetSec: 0 },
  { index: 2, bpm: 114, offsetSec: 0 },
  { index: 3, bpm: 128, offsetSec: 0 },
  { index: 4, bpm: 120, offsetSec: 0 },
];

export type DifficultyId = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  scrollSpeedPx: number; // Pixels per second downward travel speed
  summary: string;
  subdivisionBeats: number; // Base grid step in beats
  density: number; // Probability/fill factor
  allowChords: boolean;
  chordChance: number;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    scrollSpeedPx: 235,
    summary: 'Relaxed scroll · Sparse quarter notes · Single arrows',
    subdivisionBeats: 1,
    density: 0.52,
    allowChords: false,
    chordChance: 0,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    scrollSpeedPx: 325,
    summary: 'Steady scroll · Quarter & light eighth notes · Single arrows',
    subdivisionBeats: 0.5,
    density: 0.45,
    allowChords: false,
    chordChance: 0,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    scrollSpeedPx: 415,
    summary: 'Brisk scroll · Eighth-note patterns · Back-to-back runs',
    subdivisionBeats: 0.5,
    density: 0.68,
    allowChords: false,
    chordChance: 0,
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    scrollSpeedPx: 515,
    summary: 'Fast scroll · Complex rhythms · Rapid runs & light chords',
    subdivisionBeats: 0.25,
    density: 0.52,
    allowChords: true,
    chordChance: 0.12,
  },
};

export interface LaneStyle {
  lane: 0 | 1 | 2 | 3;
  key: 'ArrowLeft' | 'ArrowDown' | 'ArrowUp' | 'ArrowRight';
  symbol: string;
  label: string;
  color: string;
  glow: string;
}

export const LANES: LaneStyle[] = [
  {
    lane: 0,
    key: 'ArrowLeft',
    symbol: '←',
    label: 'Left',
    color: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
  {
    lane: 1,
    key: 'ArrowDown',
    symbol: '↓',
    label: 'Down',
    color: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  {
    lane: 2,
    key: 'ArrowUp',
    symbol: '↑',
    label: 'Up',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    lane: 3,
    key: 'ArrowRight',
    symbol: '→',
    label: 'Right',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
];

export const HIT_WINDOWS_SEC = {
  perfect: 0.06,
  good: 0.12,
  okay: 0.175,
  miss: 0.22,
} as const;
