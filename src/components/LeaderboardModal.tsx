import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Award,
  GraduationCap,
  LogIn,
  Music,
  RefreshCw,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import {
  fetchLeaderboardData,
  isFirebaseConfigured,
  LeaderboardEntryRecord,
  SongHighScoreRecord,
} from '../firebase';

type LeaderboardTab = 'ost' | 'total' | 'songs';

interface LeaderboardModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onSignIn: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  currentUser,
  onSignIn,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('ost');
  const [students, setStudents] = useState<LeaderboardEntryRecord[]>([]);
  const [songScores, setSongScores] = useState<SongHighScoreRecord[]>([]);
  const [songQuery, setSongQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardData();
      setStudents(data.students);
      setSongScores(data.songScores);
    } catch (err) {
      setError(
        err instanceof Error
          ? 'Unable to load leaderboard right now. Please try again.'
          : 'Unable to load leaderboard.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const ostRanked = useMemo(() => {
    return [...students].sort((a, b) => {
      if (b.ostCorrectCount !== a.ostCorrectCount) {
        return b.ostCorrectCount - a.ostCorrectCount;
      }
      const accA = a.ostTotalAttempts > 0 ? a.ostCorrectCount / a.ostTotalAttempts : 0;
      const accB = b.ostTotalAttempts > 0 ? b.ostCorrectCount / b.ostTotalAttempts : 0;
      if (accB !== accA) return accB - accA;
      return b.totalHighScore - a.totalHighScore;
    });
  }, [students]);

  const scoreRanked = useMemo(() => {
    return [...students].sort((a, b) => {
      if (b.totalHighScore !== a.totalHighScore) {
        return b.totalHighScore - a.totalHighScore;
      }
      if (b.bestSingleScore !== a.bestSingleScore) {
        return b.bestSingleScore - a.bestSingleScore;
      }
      return b.ostCorrectCount - a.ostCorrectCount;
    });
  }, [students]);

  const filteredSongScores = useMemo(() => {
    const q = songQuery.trim().toLowerCase();
    const sorted = [...songScores].sort((a, b) => {
      if (b.highScore !== a.highScore) return b.highScore - a.highScore;
      return b.accuracy - a.accuracy;
    });
    if (!q) return sorted;
    return sorted.filter(
      (s) =>
        s.songTitle.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.difficulty.toLowerCase().includes(q)
    );
  }, [songScores, songQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-slate-700/80 bg-[#11131C] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#151824] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2
                id="leaderboard-title"
                className="font-display text-lg font-bold text-slate-100 leading-tight truncate"
              >
                Class Leaderboard
              </h2>
              <p className="text-xs text-slate-400 truncate">
                OST Algebra 1 mastery &amp; high scores across all songs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-700/80 hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
              aria-label="Close leaderboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sign-in Prompt for Guests */}
        {!currentUser && (
          <div className="px-6 py-3 bg-amber-400/10 border-b border-amber-400/25 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <p className="text-xs text-amber-200">
              Sign in with Google to save your unlocked songs and post your OST &amp; song scores here.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="inline-flex p-1 rounded-lg bg-[#090B10] border border-slate-800/80 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ost')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'ost'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>OST Questions Correct</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('total')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'total'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>All-Songs High Score</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('songs')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'songs'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Song High Scores</span>
            </button>
          </div>

          {activeTab === 'songs' && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={songQuery}
                onChange={(e) => setSongQuery(e.target.value)}
                placeholder="Filter by song or student..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090B10] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {!isFirebaseConfigured ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Firebase is not configured for this environment.
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-950/30 text-xs text-rose-200">
              {error}
            </div>
          ) : loading && students.length === 0 && songScores.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading leaderboard standings...
            </div>
          ) : activeTab === 'ost' ? (
            ostRanked.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No student scores recorded yet. Sign in and solve an OST question to claim #1!
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-[44px_1fr_110px_100px] gap-3 px-3 pb-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80">
                  <span>Rank</span>
                  <span>Student</span>
                  <span className="text-right">OST Correct</span>
                  <span className="text-right">Accuracy</span>
                </div>
                {ostRanked.map((entry, idx) => {
                  const isSelf = currentUser?.uid === entry.uid;
                  const acc =
                    entry.ostTotalAttempts > 0
                      ? Math.round((entry.ostCorrectCount / entry.ostTotalAttempts) * 100)
                      : null;
                  return (
                    <div
                      key={entry.uid}
                      className={`grid grid-cols-[44px_1fr_110px_100px] items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                        isSelf
                          ? 'bg-amber-400/10 border-amber-400/40'
                          : 'bg-[#141724] border-slate-800/80'
                      }`}
                    >
                      <span
                        className={`font-mono tabular-nums font-bold ${
                          idx === 0
                            ? 'text-amber-300'
                            : idx === 1
                            ? 'text-slate-200'
                            : idx === 2
                            ? 'text-orange-300'
                            : 'text-slate-500'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 overflow-hidden shrink-0">
                          {entry.photoURL ? (
                            <img
                              src={entry.photoURL}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            entry.displayName.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <span className="truncate font-medium text-slate-100">
                          {entry.displayName}
                          {isSelf && (
                            <span className="ml-1.5 text-[11px] text-amber-300 font-semibold">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-right font-mono tabular-nums font-bold text-emerald-300">
                        {entry.ostCorrectCount}
                      </span>
                      <span className="text-right font-mono tabular-nums text-xs text-slate-300">
                        {acc !== null ? `${acc}% (${entry.ostTotalAttempts})` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'total' ? (
            scoreRanked.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No song scores recorded yet. Finish a track while signed in to rank!
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-[44px_1fr_120px_110px_70px] gap-3 px-3 pb-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80">
                  <span>Rank</span>
                  <span>Student</span>
                  <span className="text-right">Total High Score</span>
                  <span className="text-right">Best Song</span>
                  <span className="text-right">Songs</span>
                </div>
                {scoreRanked.map((entry, idx) => {
                  const isSelf = currentUser?.uid === entry.uid;
                  return (
                    <div
                      key={entry.uid}
                      className={`grid grid-cols-[44px_1fr_120px_110px_70px] items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${
                        isSelf
                          ? 'bg-amber-400/10 border-amber-400/40'
                          : 'bg-[#141724] border-slate-800/80'
                      }`}
                    >
                      <span
                        className={`font-mono tabular-nums font-bold ${
                          idx === 0
                            ? 'text-amber-300'
                            : idx === 1
                            ? 'text-slate-200'
                            : idx === 2
                            ? 'text-orange-300'
                            : 'text-slate-500'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 overflow-hidden shrink-0">
                          {entry.photoURL ? (
                            <img
                              src={entry.photoURL}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            entry.displayName.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <span className="truncate font-medium text-slate-100">
                          {entry.displayName}
                          {isSelf && (
                            <span className="ml-1.5 text-[11px] text-amber-300 font-semibold">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-right font-mono tabular-nums font-bold text-amber-300">
                        {entry.totalHighScore.toLocaleString()}
                      </span>
                      <span className="text-right font-mono tabular-nums text-xs text-cyan-300">
                        {entry.bestSingleScore.toLocaleString()}
                      </span>
                      <span className="text-right font-mono tabular-nums text-xs text-slate-300">
                        {entry.songsPlayedCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          ) : filteredSongScores.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {songQuery.trim()
                ? `No high scores match "${songQuery}".`
                : 'No per-song high scores recorded yet. Complete any track while signed in!'}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[44px_1fr_130px_96px_80px] gap-3 px-3 pb-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80">
                <span>Rank</span>
                <span>Song &amp; Student</span>
                <span className="text-right">High Score</span>
                <span className="text-right">Difficulty</span>
                <span className="text-right">Acc</span>
              </div>
              {filteredSongScores.map((row, idx) => {
                const isSelf = currentUser?.uid === row.userId;
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[44px_1fr_130px_96px_80px] items-center gap-3 px-3 py-2.5 rounded-lg border text-xs ${
                      isSelf
                        ? 'bg-amber-400/10 border-amber-400/40'
                        : 'bg-[#141724] border-slate-800/80'
                    }`}
                  >
                    <span
                      className={`font-mono tabular-nums font-bold ${
                        idx === 0
                          ? 'text-amber-300'
                          : idx === 1
                          ? 'text-slate-200'
                          : idx === 2
                          ? 'text-orange-300'
                          : 'text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{row.songTitle}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {row.displayName}
                        {isSelf ? ' (You)' : ''} · Max {row.maxCombo}x
                      </p>
                    </div>
                    <span className="text-right font-mono tabular-nums text-sm font-bold text-amber-300">
                      {row.highScore.toLocaleString()}
                    </span>
                    <span className="text-right capitalize text-slate-300">{row.difficulty}</span>
                    <span className="text-right font-mono tabular-nums text-cyan-300">
                      {row.accuracy}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
