import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lock,
  LogIn,
  LogOut,
  Music,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Trophy,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CUSTOM_SONGS,
  DIFFICULTIES,
  DifficultyId,
  INITIAL_UNLOCKED_SONGS,
  LANES,
} from './config/songs';
import {
  OST_QUESTIONS,
  OST_TOPICS,
  OstQuestion,
  OstTopicId,
} from './data/ostQuestions';
import {
  auth,
  isFirebaseConfigured,
  loadStudentProgress,
  recordSongScoreToLeaderboard,
  saveStudentProgress,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { generateChart } from './utils/chartGenerator';
import { playErrorBuzz, playUnlockChime } from './utils/soundFx';
import { LiveScoreState, RhythmHighway } from './components/RhythmHighway';
import { MathGatewayModal, RoundStats } from './components/MathGatewayModal';
import { LeaderboardModal } from './components/LeaderboardModal';

const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'medium', 'hard', 'expert'];
const GUEST_STORAGE_KEY = 'fretmath_guest_progress_v1';
const TOPIC_STORAGE_KEY = 'fretmath_ost_topic_v1';

function loadSavedTopic(): OstTopicId {
  try {
    const raw = localStorage.getItem(TOPIC_STORAGE_KEY);
    if (raw && OST_TOPICS.some((t) => t.id === raw)) {
      return raw as OstTopicId;
    }
  } catch {
    // ignore
  }
  return 'all';
}

interface GuestProgress {
  unlockedVideoIds: string[];
  passedVideoIds: string[];
  availableUnlocks: number;
  ostCorrectCount: number;
  ostTotalAttempts: number;
}

function loadGuestProgress(): GuestProgress | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      unlockedVideoIds: Array.isArray(parsed.unlockedVideoIds) ? parsed.unlockedVideoIds : [],
      passedVideoIds: Array.isArray(parsed.passedVideoIds) ? parsed.passedVideoIds : [],
      availableUnlocks: Math.max(0, Number(parsed.availableUnlocks) || 0),
      ostCorrectCount: Math.max(0, Number(parsed.ostCorrectCount) || 0),
      ostTotalAttempts: Math.max(0, Number(parsed.ostTotalAttempts) || 0),
    };
  } catch {
    return null;
  }
}

function saveGuestProgress(progress: GuestProgress) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota issues
  }
}

function clearGuestProgress() {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function pickNextQuestion(
  usedIds: Set<string>,
  excludeId?: string,
  topic: OstTopicId = 'all'
): OstQuestion {
  const scoped =
    topic === 'all' ? OST_QUESTIONS : OST_QUESTIONS.filter((q) => q.topic === topic);
  const baseList = scoped.length > 0 ? scoped : OST_QUESTIONS;
  const fresh = baseList.filter((q) => !usedIds.has(q.id) && q.id !== excludeId);
  const candidates =
    fresh.length > 0 ? fresh : baseList.filter((q) => q.id !== excludeId);
  const finalPool = candidates.length > 0 ? candidates : baseList;
  return finalPool[Math.floor(Math.random() * finalPool.length)] || OST_QUESTIONS[0];
}

export default function App() {
  const [difficulty, setDifficulty] = useState<DifficultyId>('medium');
  const [bpmOverride, setBpmOverride] = useState<number | null>(null);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [resetToken, setResetToken] = useState<number>(0);
  const [trackSearch, setTrackSearch] = useState<string>('');

  // Auth & Cloud Progress state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(() => !isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Track unlocks & 80%+ accuracy passes by YouTube videoId
  const [unlockedVideoIds, setUnlockedVideoIds] = useState<Set<string>>(() => {
    const guest = loadGuestProgress();
    return new Set(guest?.unlockedVideoIds || []);
  });
  const [passedVideoIds, setPassedVideoIds] = useState<Set<string>>(() => {
    const guest = loadGuestProgress();
    return new Set(guest?.passedVideoIds || []);
  });
  const [availableUnlocks, setAvailableUnlocks] = useState<number>(() => {
    const guest = loadGuestProgress();
    return guest?.availableUnlocks || 0;
  });

  // Educational Math Gateway state
  const [isGatewayLocked, setIsGatewayLocked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'end-of-song' | 'unlock-song'>('end-of-song');
  const [gatewaySolved, setGatewaySolved] = useState<boolean>(false);
  const [targetUnlockVideoId, setTargetUnlockVideoId] = useState<string | null>(null);
  const [mathAttempts, setMathAttempts] = useState<{ correct: number; total: number }>(() => {
    const guest = loadGuestProgress();
    return {
      correct: guest?.ostCorrectCount || 0,
      total: guest?.ostTotalAttempts || 0,
    };
  });
  const [selectedTopic, setSelectedTopic] = useState<OstTopicId>(loadSavedTopic);
  const selectedTopicRef = useRef<OstTopicId>(selectedTopic);
  selectedTopicRef.current = selectedTopic;
  const [activeQuestion, setActiveQuestion] = useState<OstQuestion>(() =>
    pickNextQuestion(new Set(), undefined, loadSavedTopic())
  );
  const [roundStats, setRoundStats] = useState<RoundStats | null>(null);
  const usedQuestionIdsRef = useRef<Set<string>>(new Set());

  const guestEarnedRef = useRef<boolean>(false);
  const userRef = useRef<User | null>(null);
  userRef.current = user;
  const unlockedVideoIdsRef = useRef<Set<string>>(unlockedVideoIds);
  unlockedVideoIdsRef.current = unlockedVideoIds;
  const passedVideoIdsRef = useRef<Set<string>>(passedVideoIds);
  passedVideoIdsRef.current = passedVideoIds;
  const availableUnlocksRef = useRef<number>(availableUnlocks);
  availableUnlocksRef.current = availableUnlocks;
  const mathAttemptsRef = useRef<{ correct: number; total: number }>(mathAttempts);
  mathAttemptsRef.current = mathAttempts;
  const difficultyRef = useRef<DifficultyId>(difficulty);
  difficultyRef.current = difficulty;

  const [liveScore, setLiveScore] = useState<LiveScoreState>({
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
  const liveScoreRef = useRef(liveScore);
  liveScoreRef.current = liveScore;

  const currentTitleRef = useRef<string>('Track 1');
  const currentVideoIdRef = useRef<string>('');

  const persistProgress = useCallback(
    (
      nextUnlocked: Set<string>,
      nextAvailable: number,
      nextMath: { correct: number; total: number },
      nextPassed: Set<string> = passedVideoIdsRef.current
    ) => {
      const idsArray = Array.from(nextUnlocked);
      const passedArray = Array.from(nextPassed);
      const activeUser = userRef.current;
      if (activeUser) {
        saveStudentProgress(activeUser, {
          unlockedVideoIds: idsArray,
          passedVideoIds: passedArray,
          availableUnlocks: nextAvailable,
          ostCorrectCount: nextMath.correct,
          ostTotalAttempts: nextMath.total,
        }).catch((err) => {
          console.error('Failed to save progress to Firestore:', err);
        });
      } else {
        saveGuestProgress({
          unlockedVideoIds: idsArray,
          passedVideoIds: passedArray,
          availableUnlocks: nextAvailable,
          ostCorrectCount: nextMath.correct,
          ostTotalAttempts: nextMath.total,
        });
      }
    },
    []
  );

  const triggerMathGateway = useCallback(() => {
    const score = liveScoreRef.current;
    const totalNotes = score.perfect + score.good + score.okay + score.miss;
    const hitAccuracy =
      totalNotes > 0
        ? Math.round(
            ((score.perfect + score.good * 0.75 + score.okay * 0.4) / totalNotes) * 100
          )
        : 0;

    setRoundStats({
      trackTitle: currentTitleRef.current,
      score: score.score,
      maxCombo: score.maxCombo,
      perfect: score.perfect,
      good: score.good,
      okay: score.okay,
      miss: score.miss,
    });

    const activeUser = userRef.current;
    const vid = currentVideoIdRef.current;

    if (vid && totalNotes > 0 && hitAccuracy >= 80 && !passedVideoIdsRef.current.has(vid)) {
      const nextPassed = new Set(passedVideoIdsRef.current);
      nextPassed.add(vid);
      passedVideoIdsRef.current = nextPassed;
      setPassedVideoIds(nextPassed);
      if (!activeUser) guestEarnedRef.current = true;
      persistProgress(
        unlockedVideoIdsRef.current,
        availableUnlocksRef.current,
        mathAttemptsRef.current,
        nextPassed
      );
    }

    if (activeUser && vid && (totalNotes > 0 || score.score > 0)) {
      recordSongScoreToLeaderboard({
        user: activeUser,
        videoId: vid,
        songTitle: currentTitleRef.current,
        score: score.score,
        maxCombo: score.maxCombo,
        accuracy: hitAccuracy,
        difficulty: difficultyRef.current,
        ostCorrectCount: mathAttemptsRef.current.correct,
        ostTotalAttempts: mathAttemptsRef.current.total,
      }).catch((err) => {
        console.error('Failed to record song score:', err);
      });
    }

    const nextQ = pickNextQuestion(usedQuestionIdsRef.current, undefined, selectedTopicRef.current);
    setActiveQuestion(nextQ);
    setModalMode('end-of-song');
    setTargetUnlockVideoId(null);
    setGatewaySolved(false);
    setIsGatewayLocked(true);
    setIsModalOpen(true);
  }, []);

  const openUnlockSongModal = useCallback((desiredVideoId: string | null) => {
    const nextQ = pickNextQuestion(usedQuestionIdsRef.current, undefined, selectedTopicRef.current);
    setActiveQuestion(nextQ);
    setRoundStats(null);
    setModalMode('unlock-song');
    setTargetUnlockVideoId(desiredVideoId);
    setGatewaySolved(false);
    setIsModalOpen(true);
  }, []);

  const {
    playbackState,
    tracks,
    currentIndex,
    currentTitle,
    currentVideoId,
    durationSec,
    errorMessage,
    skipNotice,
    playVideoAt,
    play,
    pause,
    restartTrack,
    reshuffleTracks,
    getCurrentTime,
  } = useYouTubePlayer({
    containerId: 'yt-player-slot',
    unlockedVideoIds,
    isGatewayLocked,
    onSongEnded: triggerMathGateway,
  });

  currentTitleRef.current = currentTitle;
  currentVideoIdRef.current = currentVideoId;
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  // Ensure at least INITIAL_UNLOCKED_SONGS (5) starter songs are unlocked once playlists load
  useEffect(() => {
    if (tracks.length === 0) return;
    setUnlockedVideoIds((prev) => {
      if (prev.size >= INITIAL_UNLOCKED_SONGS) return prev;
      const next = new Set(prev);
      for (const track of tracks) {
        if (next.size >= INITIAL_UNLOCKED_SONGS) break;
        next.add(track.videoId);
      }
      if (next.size === prev.size) return prev;
      if (userRef.current) {
        saveStudentProgress(userRef.current, {
          unlockedVideoIds: Array.from(next),
          passedVideoIds: Array.from(passedVideoIdsRef.current),
          availableUnlocks: availableUnlocksRef.current,
          ostCorrectCount: mathAttemptsRef.current.correct,
          ostTotalAttempts: mathAttemptsRef.current.total,
        }).catch((err) => console.error('Failed to seed starter songs:', err));
      } else {
        saveGuestProgress({
          unlockedVideoIds: Array.from(next),
          passedVideoIds: Array.from(passedVideoIdsRef.current),
          availableUnlocks: availableUnlocksRef.current,
          ostCorrectCount: mathAttemptsRef.current.correct,
          ostTotalAttempts: mathAttemptsRef.current.total,
        });
      }
      return next;
    });
  }, [tracks]);

  // Listen to Firebase Google Auth state
  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) return;

      try {
        const cloud = await loadStudentProgress(nextUser);
        const starterIds = tracksRef.current
          .slice(0, INITIAL_UNLOCKED_SONGS)
          .map((t) => t.videoId);

        if (cloud) {
          const mergedSet = new Set(cloud.unlockedVideoIds);
          const mergedPassed = new Set(cloud.passedVideoIds || []);
          let nextAvailable = cloud.availableUnlocks;
          let nextCorrect = cloud.ostCorrectCount;
          let nextTotal = cloud.ostTotalAttempts;

          if (guestEarnedRef.current) {
            unlockedVideoIdsRef.current.forEach((id) => mergedSet.add(id));
            passedVideoIdsRef.current.forEach((id) => mergedPassed.add(id));
            nextAvailable += availableUnlocksRef.current;
            nextCorrect += mathAttemptsRef.current.correct;
            nextTotal += mathAttemptsRef.current.total;
            guestEarnedRef.current = false;
          }

          if (mergedSet.size < INITIAL_UNLOCKED_SONGS) {
            for (const id of starterIds) {
              if (mergedSet.size >= INITIAL_UNLOCKED_SONGS) break;
              mergedSet.add(id);
            }
          }

          const nextMath = { correct: nextCorrect, total: nextTotal };
          setUnlockedVideoIds(mergedSet);
          setPassedVideoIds(mergedPassed);
          setAvailableUnlocks(nextAvailable);
          setMathAttempts(nextMath);
          clearGuestProgress();

          await saveStudentProgress(nextUser, {
            unlockedVideoIds: Array.from(mergedSet),
            passedVideoIds: Array.from(mergedPassed),
            availableUnlocks: nextAvailable,
            ostCorrectCount: nextCorrect,
            ostTotalAttempts: nextTotal,
          });
        } else {
          // First-time sign-in: seed Firestore from current starter + any guest session progress
          const initialSet = new Set(unlockedVideoIdsRef.current);
          const initialPassed = new Set(passedVideoIdsRef.current);
          if (initialSet.size < INITIAL_UNLOCKED_SONGS) {
            for (const id of starterIds) {
              if (initialSet.size >= INITIAL_UNLOCKED_SONGS) break;
              initialSet.add(id);
            }
          }
          setUnlockedVideoIds(initialSet);
          setPassedVideoIds(initialPassed);
          guestEarnedRef.current = false;
          clearGuestProgress();

          await saveStudentProgress(nextUser, {
            unlockedVideoIds: Array.from(initialSet),
            passedVideoIds: Array.from(initialPassed),
            availableUnlocks: availableUnlocksRef.current,
            ostCorrectCount: mathAttemptsRef.current.correct,
            ostTotalAttempts: mathAttemptsRef.current.total,
          });
        }
      } catch (err) {
        console.error('Failed to sync student progress on login:', err);
        setAuthError('Signed in, but could not sync saved progress. Check connection.');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'This domain is not yet authorized in Firebase Auth settings. Add this domain under Authentication → Settings → Authorized domains.'
        );
        return;
      }
      setAuthError('Google sign-in could not be completed. Please allow popups and try again.');
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      await signOutUser();
      clearGuestProgress();
      guestEarnedRef.current = false;
      const starterIds = tracksRef.current
        .slice(0, INITIAL_UNLOCKED_SONGS)
        .map((t) => t.videoId);
      setUnlockedVideoIds(new Set(starterIds));
      setPassedVideoIds(new Set());
      setAvailableUnlocks(0);
      setMathAttempts({ correct: 0, total: 0 });
      setGatewaySolved(false);
      setIsGatewayLocked(false);
    } catch {
      setAuthError('Could not sign out right now.');
    }
  };

  const activeTrackMeta = useMemo(() => {
    const byId = CUSTOM_SONGS.find((c) => c.videoId && c.videoId === currentVideoId);
    const byIdx = CUSTOM_SONGS.find((c) => c.index === currentIndex);
    const override = byId || byIdx;
    return {
      bpm: bpmOverride ?? override?.bpm ?? 120,
      defaultBpm: override?.bpm ?? 120,
      offsetSec: override?.offsetSec ?? 0,
    };
  }, [bpmOverride, currentIndex, currentVideoId]);

  useEffect(() => {
    setBpmOverride(null);
    setResetToken((n) => n + 1);
  }, [currentIndex, currentVideoId]);

  const chartNotes = useMemo(() => {
    return generateChart({
      videoId: currentVideoId || `track-${currentIndex}`,
      durationSec,
      bpm: activeTrackMeta.bpm,
      difficulty,
      offsetSec: activeTrackMeta.offsetSec,
    });
  }, [
    currentVideoId,
    currentIndex,
    durationSec,
    activeTrackMeta.bpm,
    activeTrackMeta.offsetSec,
    difficulty,
  ]);

  const filteredTracks = useMemo(() => {
    const q = trackSearch.trim().toLowerCase();
    const base = !q
      ? tracks
      : tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            String(t.index + 1).includes(q) ||
            t.playlistLabel.toLowerCase().includes(q)
        );
    const unlocked: typeof tracks = [];
    const locked: typeof tracks = [];
    for (const t of base) {
      if (unlockedVideoIds.has(t.videoId)) {
        unlocked.push(t);
      } else {
        locked.push(t);
      }
    }
    return [...unlocked, ...locked];
  }, [tracks, trackSearch, unlockedVideoIds]);

  const lockedTracks = useMemo(
    () => tracks.filter((t) => !unlockedVideoIds.has(t.videoId)),
    [tracks, unlockedVideoIds]
  );

  const handleTogglePlay = useCallback(() => {
    if (isGatewayLocked) {
      setIsModalOpen(true);
      return;
    }
    if (playbackState === 'playing') {
      pause();
      return;
    }

    const activeVid = currentVideoIdRef.current;
    if (
      activeVid &&
      unlockedVideoIdsRef.current.size > 0 &&
      !unlockedVideoIdsRef.current.has(activeVid)
    ) {
      const firstUnlocked = tracksRef.current.find((t) =>
        unlockedVideoIdsRef.current.has(t.videoId)
      );
      if (firstUnlocked) {
        setResetToken((n) => n + 1);
        playVideoAt(firstUnlocked.index);
        return;
      }
      openUnlockSongModal(activeVid);
      return;
    }

    play();
  }, [isGatewayLocked, playbackState, pause, play, playVideoAt, openUnlockSongModal]);

  const handleSelectTrack = (index: number) => {
    if (isGatewayLocked) {
      setIsModalOpen(true);
      return;
    }
    const track = tracks[index];
    if (!track) return;

    if (!unlockedVideoIds.has(track.videoId)) {
      if (availableUnlocks > 0) {
        const nextSet = new Set(unlockedVideoIds);
        nextSet.add(track.videoId);
        const nextAvail = Math.max(0, availableUnlocks - 1);
        setUnlockedVideoIds(nextSet);
        setAvailableUnlocks(nextAvail);
        if (!userRef.current) guestEarnedRef.current = true;
        persistProgress(nextSet, nextAvail, mathAttemptsRef.current);

        playUnlockChime(sfxEnabled);
        setResetToken((n) => n + 1);
        playVideoAt(index);
        return;
      }

      pause();
      openUnlockSongModal(track.videoId);
      return;
    }

    setResetToken((n) => n + 1);
    playVideoAt(index);
  };

  const handleRestartTrack = () => {
    if (isGatewayLocked) {
      setIsModalOpen(true);
      return;
    }
    setResetToken((n) => n + 1);
    restartTrack();
  };

  const handleEndRoundEarly = () => {
    pause();
    triggerMathGateway();
  };

  const handleAttemptMath = (isCorrect: boolean) => {
    const nextMath = {
      correct: mathAttemptsRef.current.correct + (isCorrect ? 1 : 0),
      total: mathAttemptsRef.current.total + 1,
    };
    setMathAttempts(nextMath);
    if (!userRef.current) guestEarnedRef.current = true;

    let nextUnlocked = unlockedVideoIdsRef.current;
    let nextAvailable = availableUnlocksRef.current;

    if (isCorrect) {
      usedQuestionIdsRef.current.add(activeQuestion.id);
      setGatewaySolved(true);
      setIsGatewayLocked(false);

      if (targetUnlockVideoId) {
        nextUnlocked = new Set(unlockedVideoIdsRef.current);
        nextUnlocked.add(targetUnlockVideoId);
        setUnlockedVideoIds(nextUnlocked);
      } else if (lockedTracks.length > 0) {
        nextAvailable = availableUnlocksRef.current + 1;
        setAvailableUnlocks(nextAvailable);
      }

      playUnlockChime(sfxEnabled);
    } else {
      playErrorBuzz(sfxEnabled);
    }

    persistProgress(nextUnlocked, nextAvailable, nextMath);
  };

  const handleRequestReplacement = () => {
    const nextQ = pickNextQuestion(
      usedQuestionIdsRef.current,
      activeQuestion.id,
      selectedTopicRef.current
    );
    setActiveQuestion(nextQ);
  };

  const handleSelectTopic = (nextTopic: OstTopicId) => {
    setSelectedTopic(nextTopic);
    selectedTopicRef.current = nextTopic;
    try {
      localStorage.setItem(TOPIC_STORAGE_KEY, nextTopic);
    } catch {
      // ignore
    }
    if (!gatewaySolved) {
      setActiveQuestion(
        pickNextQuestion(usedQuestionIdsRef.current, activeQuestion.id, nextTopic)
      );
    }
  };

  const handleUnlockAndPlayTrack = (trackIndex: number) => {
    const track = tracks[trackIndex];
    if (!track) return;

    if (!unlockedVideoIds.has(track.videoId)) {
      const nextSet = new Set(unlockedVideoIds);
      nextSet.add(track.videoId);
      const nextAvail =
        targetUnlockVideoId === null
          ? Math.max(0, availableUnlocks - 1)
          : availableUnlocks;

      setUnlockedVideoIds(nextSet);
      setAvailableUnlocks(nextAvail);
      if (!userRef.current) guestEarnedRef.current = true;
      persistProgress(nextSet, nextAvail, mathAttemptsRef.current);
    }

    setIsModalOpen(false);
    setResetToken((n) => n + 1);
    playVideoAt(trackIndex);
  };

  const unlockedDisplayCount =
    tracks.length > 0
      ? tracks.filter((t) => unlockedVideoIds.has(t.videoId)).length
      : unlockedVideoIds.size;

  const targetTrack =
    targetUnlockVideoId !== null
      ? tracks.find((t) => t.videoId === targetUnlockVideoId) || null
      : null;

  const mathAccuracyPct =
    mathAttempts.total > 0
      ? Math.round((mathAttempts.correct / mathAttempts.total) * 100)
      : null;

  const totalHits = liveScore.perfect + liveScore.good + liveScore.okay;
  const totalJudged = totalHits + liveScore.miss;
  const rhythmAccuracy =
    totalJudged > 0
      ? Math.round(
          ((liveScore.perfect + liveScore.good * 0.75 + liveScore.okay * 0.4) /
            totalJudged) *
            100
        )
      : 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090E] text-slate-100">
      {/* Three-Zone Top Header */}
      <header className="shrink-0 h-14 border-b border-slate-800/80 bg-[#0D0F17]">
        <div className="max-w-[1440px] w-full h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Zone 1: Brand Wordmark */}
          <div className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            Beatz by Baker
          </div>

          {/* Zone 2: Progression Counters & Leaderboard */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#141724] whitespace-nowrap shrink-0">
              {isGatewayLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-slate-400 hidden md:inline">Unlocked</span>
              <span className="font-mono tabular-nums font-bold text-slate-100">
                {tracks.length > 0
                  ? `${unlockedDisplayCount}/${tracks.length}`
                  : unlockedDisplayCount}
              </span>
              {availableUnlocks > 0 && (
                <span className="text-amber-300 font-semibold text-xs">
                  · +{availableUnlocks}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#141724] whitespace-nowrap shrink-0">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 hidden md:inline">OST</span>
              <span className="font-mono tabular-nums font-bold text-slate-100">
                {mathAttempts.correct}
                {mathAccuracyPct !== null ? ` (${mathAccuracyPct}%)` : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-amber-400/60 bg-[#141724] text-slate-200 hover:text-amber-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-amber-400/60 bg-[#141724] transition-colors shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <label htmlFor="header-topic-select" className="sr-only">
                OST Math Topic
              </label>
              <select
                id="header-topic-select"
                value={selectedTopic}
                onChange={(e) => {
                  handleSelectTopic(e.target.value as OstTopicId);
                  e.currentTarget.blur();
                }}
                aria-label="Select OST Math Topic"
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[175px] truncate"
              >
                {OST_TOPICS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#11131C] text-slate-100">
                    {t.shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 3: Audio, Gate Action & Google Student Account */}
          <div className="flex items-center gap-2 shrink-0">
            {isGatewayLocked && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Open Gate</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSfxEnabled((s) => !s)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              aria-label={sfxEnabled ? 'Mute hit sound effects' : 'Enable hit sound effects'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden xl:inline">{sfxEnabled ? 'SFX On' : 'SFX Muted'}</span>
            </button>

            {isFirebaseConfigured && authReady && (
              user ? (
                <div className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-700/80 bg-[#141724] shrink-0">
                  <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (user.displayName || 'S').slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[96px] truncate hidden sm:inline">
                    {user.displayName || user.email?.split('@')[0] || 'Student'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Sign out"
                    aria-label="Sign out of Google account"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {authError && (
        <div className="bg-rose-950/60 border-b border-rose-500/40 px-4 py-2 text-xs text-rose-200 flex items-center justify-between max-w-[1440px] w-full mx-auto">
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-rose-300 hover:text-white font-semibold ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3-Column Arcade Layout: [Video + Shuffled Song List] | [Rhythm Highway] | [Score + Difficulty + Controls] */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-[330px_minmax(340px,1fr)_300px] gap-5 items-start">
        {/* Column 1: YouTube Stage Frame + Shuffled 180+ Song List */}
        <aside className="flex flex-col gap-4">
          {/* Visible Corner YouTube Player Frame (min >= 200x200px per YouTube API policy) */}
          <div className="rounded-xl border border-slate-800 bg-[#11131C] p-3">
            <div className="w-full min-w-[240px] h-[202px] rounded-lg overflow-hidden bg-black relative">
              <div id="yt-player-slot" className="w-full h-full" />
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5" title={currentTitle}>
                  {currentVideoId && passedVideoIds.has(currentVideoId) && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                      aria-label="Passed (80%+ accuracy)"
                    />
                  )}
                  <span className="truncate">{currentTitle}</span>
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Track #{currentIndex + 1}
                  {tracks.length > 0 ? ` of ${tracks.length}` : ''} · Shuffled Mix
                </p>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-amber-300 shrink-0">
                {activeTrackMeta.bpm} BPM
              </span>
            </div>
            {skipNotice && (
              <p className="mt-2 text-xs text-amber-200 bg-amber-950/50 border border-amber-500/40 rounded px-2.5 py-1.5">
                {skipNotice}
              </p>
            )}
            {errorMessage && (
              <p className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded px-2.5 py-1.5">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Combined Shuffled Playlist Tracks */}
          <div className="h-[360px] lg:h-[calc(100vh-380px)] min-h-[300px] max-h-[540px] rounded-xl border border-slate-800 bg-[#11131C] flex flex-col overflow-hidden relative">
            <div className="px-3.5 py-2.5 border-b border-slate-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shuffled Playlist</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {tracks.length > 0
                      ? `${unlockedDisplayCount}/${tracks.length}`
                      : 'Loading...'}
                  </span>
                  <button
                    type="button"
                    onClick={reshuffleTracks}
                    disabled={tracks.length === 0 || isGatewayLocked}
                    title="Shuffle song order"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-700/80 hover:border-amber-400/60 text-[11px] text-slate-300 hover:text-amber-200 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Shuffle</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  placeholder="Filter 180+ songs by title or #..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090B10] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {availableUnlocks > 0 && (
                <div className="px-2.5 py-1.5 rounded-md bg-amber-400/15 border border-amber-400/35 text-[11px] text-amber-200 font-medium">
                  {availableUnlocks} song unlock{availableUnlocks > 1 ? 's' : ''} ready — click any
                  locked track to open it!
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {tracks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Loading &amp; shuffling songs from both YouTube playlists...
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No songs match &ldquo;{trackSearch}&rdquo;.
                </div>
              ) : (
                filteredTracks.map((track, listIdx) => {
                  const isActive = track.videoId === currentVideoId;
                  const isLockedTrack = !unlockedVideoIds.has(track.videoId);
                  const isPassedTrack = passedVideoIds.has(track.videoId);
                  const prevTrack = listIdx > 0 ? filteredTracks[listIdx - 1] : null;
                  const showLockedDivider =
                    isLockedTrack && prevTrack !== null && unlockedVideoIds.has(prevTrack.videoId);
                  return (
                    <React.Fragment key={track.videoId}>
                      {showLockedDivider && (
                        <div className="px-2 pt-2 pb-1 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                          <span className="h-px flex-1 bg-slate-800" />
                          <span>Locked — Solve OST Question</span>
                          <span className="h-px flex-1 bg-slate-800" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={isGatewayLocked}
                        onClick={() => handleSelectTrack(track.index)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                          isLockedTrack
                            ? availableUnlocks > 0
                              ? 'text-amber-200/90 hover:bg-amber-400/15 border border-amber-400/25'
                              : 'text-slate-500 hover:bg-slate-800/40 border border-slate-800/60'
                            : isActive
                            ? 'bg-amber-400/15 text-amber-200 border border-amber-400/40'
                            : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                        } disabled:opacity-45 disabled:pointer-events-none`}
                      >
                        {isPassedTrack && (
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                            aria-label="Passed with 80%+ accuracy"
                          />
                        )}
                        <span className="font-mono tabular-nums text-[11px] text-slate-500 w-7 shrink-0">
                          {String(track.index + 1).padStart(3, '0')}
                        </span>
                        <span className="truncate flex-1 font-medium">{track.title}</span>
                        {isLockedTrack ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 shrink-0">
                            <Lock className="w-3 h-3" />
                            <span>{availableUnlocks > 0 ? 'Claim' : 'OST'}</span>
                          </span>
                        ) : (
                          <span className="font-mono tabular-nums text-[10px] text-slate-400 shrink-0">
                            {track.bpm}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {isGatewayLocked && (
              <div className="absolute inset-0 bg-[#090B11]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                <Lock className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-xs font-semibold text-slate-100">Song Selector Locked</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Answer the OST Algebra 1 question to unlock whichever song you want next.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Answer Math Question
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Column 2: Centered 4-Lane Rhythm Highway */}
        <section className="flex justify-center w-full">
          <div className="w-full max-w-[460px] h-[540px] lg:h-[calc(100vh-92px)] min-h-[480px] max-h-[760px]">
            <RhythmHighway
              notes={chartNotes}
              resetToken={resetToken}
              difficulty={difficulty}
              bpm={activeTrackMeta.bpm}
              offsetSec={activeTrackMeta.offsetSec}
              playbackState={playbackState}
              isGatewayLocked={isGatewayLocked || isModalOpen || isLeaderboardOpen}
              sfxEnabled={sfxEnabled}
              getCurrentTime={getCurrentTime}
              onScoreChange={setLiveScore}
              onTogglePlay={handleTogglePlay}
            />
          </div>
        </section>

        {/* Column 3: Live Scoreboard + Difficulty/BPM + Controls */}
        <aside className="flex flex-col gap-3.5">
          {/* Score & Streak Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#11131C] p-3.5 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Live Score</span>
                <div className="font-mono tabular-nums text-2xl font-bold text-slate-100 mt-0.5">
                  {liveScore.score.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Streak</span>
                  <span className="font-mono tabular-nums text-lg font-bold text-amber-300">
                    {liveScore.combo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Mult</span>
                  <span className="font-mono tabular-nums text-lg font-bold text-cyan-300">
                    {liveScore.multiplier}x
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-y-1 gap-x-3 text-xs font-mono tabular-nums">
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">Accuracy</span>
                <span>{rhythmAccuracy}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">Best</span>
                <span>{liveScore.maxCombo}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span className="font-sans">Perfect</span>
                <span>{liveScore.perfect}</span>
              </div>
              <div className="flex justify-between text-cyan-300">
                <span className="font-sans">Good</span>
                <span>{liveScore.good}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span className="font-sans">Okay</span>
                <span>{liveScore.okay}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span className="font-sans">Miss</span>
                <span>{liveScore.miss}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Selector & BPM Calibration */}
          <div className="rounded-xl border border-slate-800 bg-[#11131C] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Difficulty</span>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                {DIFFICULTIES[difficulty].scrollSpeedPx} px/s
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#090B10] border border-slate-800/80">
              {DIFFICULTY_ORDER.map((id) => {
                const active = difficulty === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDifficulty(id)}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {DIFFICULTIES[id].label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {DIFFICULTIES[difficulty].summary}
            </p>

            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bpm-slider" className="text-slate-300 font-medium">
                  Chart BPM
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-amber-300 font-semibold">
                    {activeTrackMeta.bpm}
                  </span>
                  {bpmOverride !== null && (
                    <button
                      type="button"
                      onClick={() => setBpmOverride(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                id="bpm-slider"
                type="range"
                min={60}
                max={200}
                step={1}
                value={activeTrackMeta.bpm}
                onChange={(e) => setBpmOverride(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Playback & Gateway Controls */}
          <div className="rounded-xl border border-slate-800 bg-[#11131C] p-3.5 space-y-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={playbackState === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {playbackState === 'playing' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Track</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{playbackState === 'paused' ? 'Resume Track' : 'Play Track'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestartTrack}
              disabled={isGatewayLocked || playbackState === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Song</span>
            </button>

            <button
              type="button"
              onClick={handleEndRoundEarly}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Complete &amp; Open Math Gate</span>
            </button>
          </div>

          {/* Arrow Key Legend & Rules */}
          <div className="rounded-xl border border-slate-800 bg-[#11131C] p-3.5 space-y-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {LANES.map((lane) => (
                <div
                  key={lane.lane}
                  className="flex flex-col items-center py-1.5 rounded-lg border border-slate-800 bg-[#0A0C12]"
                >
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: lane.color }}
                  >
                    {lane.symbol}
                  </span>
                  <span className="text-[10px] text-slate-400">{lane.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              5 starter songs are open. Hit 80%+ accuracy to earn a Pass check, and solve OST
              questions to unlock new tracks.
              {!user && isFirebaseConfigured
                ? ' Sign in with Google to save progress and join the leaderboard.'
                : ''}
            </p>
            {gatewaySolved && !isGatewayLocked && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Last OST gateway cleared</span>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Educational Math Gateway Modal */}
      <MathGatewayModal
        isOpen={isModalOpen}
        mode={modalMode}
        roundStats={roundStats}
        question={activeQuestion}
        selectedTopic={selectedTopic}
        isSolved={gatewaySolved}
        targetTrack={targetTrack}
        lockedTracks={lockedTracks}
        availableUnlocks={availableUnlocks}
        onSelectTopic={handleSelectTopic}
        onAttempt={handleAttemptMath}
        onRequestReplacement={handleRequestReplacement}
        onUnlockAndPlayTrack={handleUnlockAndPlayTrack}
        onCloseToMenu={() => setIsModalOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        currentUser={user}
        onSignIn={handleGoogleSignIn}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
