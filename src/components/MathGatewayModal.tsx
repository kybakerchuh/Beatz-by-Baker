import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lock,
  RefreshCw,
  Search,
  Unlock,
  XCircle,
} from 'lucide-react';
import {
  isNumericAnswerCorrect,
  OST_QUESTIONS,
  OST_TOPICS,
  OstQuestion,
  OstTopicId,
} from '../data/ostQuestions';
import { PlaylistTrack } from '../hooks/useYouTubePlayer';
import { MathText } from './MathText';
import { OstDiagram } from './OstDiagram';

export interface RoundStats {
  trackTitle: string;
  score: number;
  maxCombo: number;
  perfect: number;
  good: number;
  okay: number;
  miss: number;
}

interface MathGatewayModalProps {
  isOpen: boolean;
  mode: 'end-of-song' | 'unlock-song';
  roundStats: RoundStats | null;
  question: OstQuestion;
  selectedTopic: OstTopicId;
  isSolved: boolean;
  targetTrack: PlaylistTrack | null;
  lockedTracks: PlaylistTrack[];
  availableUnlocks: number;
  onSelectTopic: (topic: OstTopicId) => void;
  onAttempt: (isCorrect: boolean) => void;
  onRequestReplacement: () => void;
  onUnlockAndPlayTrack: (trackIndex: number) => void;
  onCloseToMenu: () => void;
}

export const MathGatewayModal: React.FC<MathGatewayModalProps> = ({
  isOpen,
  mode,
  roundStats,
  question,
  selectedTopic,
  isSolved,
  targetTrack,
  lockedTracks,
  availableUnlocks,
  onSelectTopic,
  onAttempt,
  onRequestReplacement,
  onUnlockAndPlayTrack,
  onCloseToMenu,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [numericValue, setNumericValue] = useState<string>('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [unlockSearch, setUnlockSearch] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedChoice(null);
    setNumericValue('');
    setFeedbackState(isSolved ? 'correct' : 'idle');
    setWrongCount(0);
    setUnlockSearch('');
    if (question.type === 'numeric' && isOpen && !isSolved) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [question.id, isOpen, isSolved]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = { all: OST_QUESTIONS.length };
    for (const q of OST_QUESTIONS) {
      map[q.topic] = (map[q.topic] || 0) + 1;
    }
    return map;
  }, []);

  const filteredLockedTracks = useMemo(() => {
    const q = unlockSearch.trim().toLowerCase();
    if (!q) return lockedTracks;
    return lockedTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        String(t.index + 1).includes(q) ||
        t.playlistLabel.toLowerCase().includes(q)
    );
  }, [lockedTracks, unlockSearch]);

  if (!isOpen) return null;

  const totalNotes = roundStats
    ? roundStats.perfect + roundStats.good + roundStats.okay + roundStats.miss
    : 0;
  const hitAccuracy =
    totalNotes > 0 && roundStats
      ? Math.round(
          ((roundStats.perfect + roundStats.good * 0.75 + roundStats.okay * 0.4) /
            totalNotes) *
            100
        )
      : 0;
  const songPassed = totalNotes > 0 && hitAccuracy >= 80;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSolved) return;

    let correct = false;
    if (question.type === 'multiple-choice') {
      if (!selectedChoice) return;
      correct = selectedChoice === question.correctAnswer;
    } else {
      if (!numericValue.trim()) return;
      correct = isNumericAnswerCorrect(numericValue, question.correctAnswer);
    }

    onAttempt(correct);
    if (correct) {
      setFeedbackState('correct');
    } else {
      setFeedbackState('wrong');
      setWrongCount((c) => c + 1);
    }
  };

  const canSubmit =
    question.type === 'multiple-choice'
      ? selectedChoice !== null
      : numericValue.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="math-gateway-title"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-xl border border-slate-700/80 bg-[#11131C] shadow-2xl">
        {/* Top Banner: Song Finished or Unlock Specific Track */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#151824] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isSolved ? (
              <Unlock className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="min-w-0">
              <h2
                id="math-gateway-title"
                className="font-display text-lg font-bold text-slate-100 leading-tight truncate"
              >
                {isSolved
                  ? 'OST Gateway Cleared'
                  : mode === 'unlock-song' && targetTrack
                  ? `Unlock Track #${targetTrack.index + 1}`
                  : 'OST Math Gateway'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {roundStats
                  ? `${roundStats.trackTitle} · Solve to earn a song unlock`
                  : targetTrack
                  ? `Solve this OST question to unlock "${targetTrack.title}"`
                  : 'Solve an Algebra 1 OST question to unlock any locked song'}
              </p>
            </div>
          </div>

          {roundStats && (
            <div className="flex items-center gap-5 text-xs font-mono tabular-nums shrink-0">
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Score</span>
                <span className="text-slate-100 font-bold text-sm">
                  {roundStats.score.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Max Streak</span>
                <span className="text-amber-300 font-bold text-sm">{roundStats.maxCombo}x</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Rhythm Acc</span>
                <span
                  className={`font-bold text-sm ${
                    songPassed ? 'text-emerald-300' : 'text-cyan-300'
                  }`}
                >
                  {hitAccuracy}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Song Status</span>
                {songPassed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold text-sm font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passed</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-xs font-sans">
                    Need 80%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Playbook Topic Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <label
              htmlFor="modal-topic-select"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Playbook Topic</span>
            </label>
            <select
              id="modal-topic-select"
              value={selectedTopic}
              onChange={(e) => onSelectTopic(e.target.value as OstTopicId)}
              className="w-full sm:w-auto sm:min-w-[260px] px-3 py-1.5 rounded-lg bg-[#090B10] border border-slate-700 text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-400"
            >
              {OST_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({topicCounts[t.id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Unboxed Metadata Line */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Algebra 1 OST Playbook · {question.unit} · Page {question.playbookPage}
            </span>
            <span>{question.type === 'multiple-choice' ? 'Multiple Choice' : 'Numeric Input'}</span>
          </div>

          <div className="space-y-3">
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
              <MathText text={question.prompt} />
            </p>

            {question.equation && (
              <div className="px-4 py-3.5 rounded-lg bg-[#0A0C12] border border-slate-800 font-mono text-base sm:text-lg text-amber-200 tracking-wide leading-relaxed">
                <MathText text={question.equation} />
              </div>
            )}

            {question.diagram && <OstDiagram diagram={question.diagram} />}
          </div>

          {/* Answer Controls */}
          {question.type === 'multiple-choice' && question.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt) => {
                const isSelected = selectedChoice === opt.id;
                const showCorrect = isSolved && opt.id === question.correctAnswer;
                const showWrong =
                  feedbackState === 'wrong' && isSelected && opt.id !== question.correctAnswer;

                let btnStyle =
                  'border-slate-700/80 bg-[#171A26] text-slate-200 hover:border-slate-500 hover:bg-[#1D2130]';
                if (showCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200';
                } else if (showWrong) {
                  btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-200';
                } else if (isSelected) {
                  btnStyle = 'border-amber-400 bg-amber-400/15 text-amber-100';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSolved}
                    onClick={() => {
                      setSelectedChoice(opt.id);
                      if (feedbackState === 'wrong') setFeedbackState('idle');
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold uppercase bg-black/30 border border-white/10 shrink-0">
                      {opt.id}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">
                      <MathText text={opt.label} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                disabled={isSolved}
                value={numericValue}
                onChange={(e) => {
                  setNumericValue(e.target.value);
                  if (feedbackState === 'wrong') setFeedbackState('idle');
                }}
                placeholder={question.placeholder || 'Type your numeric answer...'}
                className="w-full max-w-xs px-4 py-2.5 rounded-lg bg-[#0A0C12] border border-slate-700 text-slate-100 font-mono text-base placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
                aria-label="Numeric math answer"
              />
              {question.unitLabel && (
                <span className="text-sm text-slate-300 font-medium">{question.unitLabel}</span>
              )}
            </div>
          )}

          {/* Wrong Feedback */}
          {feedbackState === 'wrong' && !isSolved && (
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-950/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Not quite — check the Playbook Hint and try again</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  <MathText text={question.hint} />
                </span>
              </div>
            </div>
          )}

          {/* Correct Feedback & Free-Choice Song Unlock Picker */}
          {isSolved && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-emerald-500/40 bg-emerald-950/30 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {targetTrack
                      ? `Correct! "${targetTrack.title}" is now unlocked.`
                      : `Correct! You earned 1 song unlock (${availableUnlocks} available).`}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <MathText text={question.explanation} />
                </p>
              </div>

              {/* Choose whichever locked song they want to unlock */}
              {!targetTrack && lockedTracks.length > 0 && availableUnlocks > 0 && (
                <div className="rounded-lg border border-slate-700/80 bg-[#0B0D14] p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Pick Any Locked Song to Unlock ({lockedTracks.length} locked)
                    </span>
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={unlockSearch}
                        onChange={(e) => setUnlockSearch(e.target.value)}
                        placeholder="Search song or #..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#131622] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                    {filteredLockedTracks.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        No matching locked tracks found.
                      </p>
                    ) : (
                      filteredLockedTracks.map((track) => (
                        <button
                          key={`${track.videoId}-${track.index}`}
                          type="button"
                          onClick={() => onUnlockAndPlayTrack(track.index)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-[#141724] hover:bg-amber-400/15 border border-slate-800 hover:border-amber-400/50 text-left text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono tabular-nums text-[11px] text-slate-400 w-7 shrink-0">
                              #{track.index + 1}
                            </span>
                            <span className="truncate text-slate-100 font-medium">
                              {track.title}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 shrink-0">
                            <Unlock className="w-3 h-3" />
                            <span>Unlock &amp; Play</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            {!isSolved ? (
              <>
                <div className="flex items-center gap-2">
                  {mode === 'unlock-song' && (
                    <button
                      type="button"
                      onClick={onCloseToMenu}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onRequestReplacement}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{wrongCount > 0 ? 'Try Replacement Question' : 'Swap Question'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Verify &amp; Unlock</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCloseToMenu}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
                >
                  {availableUnlocks > 0 && !targetTrack
                    ? 'Save Unlock & Browse List'
                    : 'Back to Track List'}
                </button>
                {targetTrack && (
                  <button
                    type="button"
                    onClick={() => onUnlockAndPlayTrack(targetTrack.index)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Play Track #{targetTrack.index + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
