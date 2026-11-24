import { useCallback, useEffect, useRef, useState } from 'react';
import { CUSTOM_SONGS, PLAYLIST_OPTIONS } from '../config/songs';

export interface PlaylistTrack {
  index: number; // Unified shuffled index across all merged playlists (0 .. N-1)
  videoId: string;
  playlistId: string;
  playlistIndex: number;
  playlistLabel: string;
  title: string;
  bpm: number;
  offsetSec: number;
}

export type PlayerPlaybackState =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          width?: number | string;
          height?: number | string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number; target: YTPlayerInstance }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayerInstance {
  loadPlaylist: (config: {
    list: string;
    listType: 'playlist';
    index?: number;
    startSeconds?: number;
  }) => void;
  cuePlaylist: (config: {
    list: string;
    listType: 'playlist';
    index?: number;
    startSeconds?: number;
  }) => void;
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  playVideoAt: (index: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlaylist: () => string[] | null;
  getPlaylistIndex: () => number;
  getVideoData: () => { video_id?: string; title?: string; author?: string } | null;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

const TITLE_CACHE_KEY = 'fretmath_yt_titles_v1';

function loadTitleCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TITLE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTitleCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(TITLE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage quota issues
  }
}

function getOverride(index: number, videoId: string) {
  return (
    CUSTOM_SONGS.find((c) => c.videoId && c.videoId === videoId) ||
    CUSTOM_SONGS.find((c) => c.index !== undefined && c.index === index)
  );
}

/**
 * Fetches all video IDs from an additional YouTube playlist using a temporary
 * metadata-only YT.Player instance that is immediately destroyed once read.
 */
function fetchPlaylistIdsOnce(playlistId: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (!window.YT?.Player || typeof document === 'undefined') {
      resolve([]);
      return;
    }

    const tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.right = '0';
    tempWrapper.style.bottom = '0';
    tempWrapper.style.width = '200px';
    tempWrapper.style.height = '200px';
    tempWrapper.style.opacity = '0.01';
    tempWrapper.style.pointerEvents = 'none';
    tempWrapper.style.zIndex = '1';
    const tempSlotId = `yt-meta-${playlistId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const slot = document.createElement('div');
    slot.id = tempSlotId;
    tempWrapper.appendChild(slot);
    document.body.appendChild(tempWrapper);

    let finished = false;
    let pollTimer: number | null = null;
    let timeoutTimer: number | null = null;
    let metaPlayer: YTPlayerInstance | null = null;

    const cleanup = (result: string[]) => {
      if (finished) return;
      finished = true;
      if (pollTimer !== null) clearInterval(pollTimer);
      if (timeoutTimer !== null) clearTimeout(timeoutTimer);
      try {
        metaPlayer?.destroy();
      } catch {
        // ignore
      }
      tempWrapper.remove();
      resolve(result);
    };

    timeoutTimer = window.setTimeout(() => {
      const ids = metaPlayer?.getPlaylist?.() || [];
      cleanup(ids);
    }, 12000);

    try {
      metaPlayer = new window.YT.Player(tempSlotId, {
        width: 200,
        height: 200,
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: 0,
          controls: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (ev) => {
            const p = ev.target;
            const initial = p.getPlaylist();
            if (initial && initial.length > 0) {
              cleanup(initial);
              return;
            }
            try {
              p.cuePlaylist({ list: playlistId, listType: 'playlist', index: 0 });
            } catch {
              // ignore
            }
            pollTimer = window.setInterval(() => {
              const ids = p.getPlaylist();
              if (ids && ids.length > 0) {
                cleanup(ids);
              }
            }, 250);
          },
          onStateChange: (ev) => {
            const ids = ev.target.getPlaylist();
            if (ids && ids.length > 0) {
              cleanup(ids);
            }
          },
          onError: () => {
            const ids = metaPlayer?.getPlaylist?.() || [];
            if (ids.length > 0) cleanup(ids);
          },
        },
      });
    } catch {
      cleanup([]);
    }
  });
}

async function fetchPlaylistIdsWithRetry(playlistId: string): Promise<string[]> {
  const first = await fetchPlaylistIdsOnce(playlistId);
  if (first.length > 0) return first;
  return fetchPlaylistIdsOnce(playlistId);
}

/** Fisher-Yates shuffle */
function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function useYouTubePlayer({
  containerId,
  unlockedVideoIds,
  isGatewayLocked,
  onSongEnded,
}: {
  containerId: string;
  unlockedVideoIds: Set<string>;
  isGatewayLocked: boolean;
  onSongEnded: () => void;
}) {
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const onSongEndedRef = useRef(onSongEnded);
  onSongEndedRef.current = onSongEnded;
  const unlockedVideoIdsRef = useRef(unlockedVideoIds);
  unlockedVideoIdsRef.current = unlockedVideoIds;
  const isGatewayLockedRef = useRef(isGatewayLocked);
  isGatewayLockedRef.current = isGatewayLocked;

  const [playbackState, setPlaybackState] = useState<PlayerPlaybackState>('loading');
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentTitle, setCurrentTitle] = useState<string>('Loading playlists...');
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [durationSec, setDurationSec] = useState<number>(180);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);

  const titleCacheRef = useRef<Record<string, string>>(loadTitleCache());
  const endedGuardRef = useRef<boolean>(false);
  const tracksRef = useRef<PlaylistTrack[]>([]);
  tracksRef.current = tracks;
  const currentIndexRef = useRef<number>(0);
  currentIndexRef.current = currentIndex;
  const currentVideoIdRef = useRef<string>('');
  currentVideoIdRef.current = currentVideoId;
  const playbackStateRef = useRef<PlayerPlaybackState>('loading');
  playbackStateRef.current = playbackState;

  const randomWeightRef = useRef<Record<string, number>>({});
  const consecutiveErrorsRef = useRef<number>(0);
  const skipTimeoutRef = useRef<number | null>(null);
  const hasUserStartedRef = useRef<boolean>(false);

  const hydrateTitlesInBatches = useCallback((allTracks: PlaylistTrack[]) => {
    let cancelled = false;

    const missing = allTracks.filter(
      (t) => !getOverride(t.index, t.videoId)?.title && !titleCacheRef.current[t.videoId]
    );
    if (missing.length === 0) return () => {};

    const run = async () => {
      const batchSize = 8;
      for (let i = 0; i < missing.length; i += batchSize) {
        if (cancelled) break;
        const batch = missing.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (track) => {
            try {
              const res = await fetch(
                `https://www.youtube.com/oembed?url=${encodeURIComponent(
                  `https://www.youtube.com/watch?v=${track.videoId}`
                )}&format=json`
              );
              if (!res.ok) return;
              const data = await res.json();
              if (data && typeof data.title === 'string') {
                titleCacheRef.current[track.videoId] = data.title;
              }
            } catch {
              // ignore individual oEmbed error
            }
          })
        );
        if (cancelled) break;
        saveTitleCache(titleCacheRef.current);
        setTracks((prev) =>
          prev.map((t) => {
            const override = getOverride(t.index, t.videoId);
            if (override?.title) return t;
            const cached = titleCacheRef.current[t.videoId];
            return cached && cached !== t.title ? { ...t, title: cached } : t;
          })
        );
        await new Promise((r) => setTimeout(r, 80));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildCombinedTracks = useCallback(
    (
      listsByPlaylist: { playlistId: string; label: string; ids: string[] }[],
      canCueInitial: boolean
    ) => {
      const seen = new Set<string>();
      const rawItems: {
        videoId: string;
        playlistId: string;
        playlistIndex: number;
        playlistLabel: string;
      }[] = [];

      listsByPlaylist.forEach(({ playlistId, label, ids }) => {
        ids.forEach((videoId, playlistIndex) => {
          if (!videoId || seen.has(videoId)) return;
          seen.add(videoId);
          if (randomWeightRef.current[videoId] === undefined) {
            randomWeightRef.current[videoId] = Math.random();
          }
          rawItems.push({ videoId, playlistId, playlistIndex, playlistLabel: label });
        });
      });

      // Sort by random weights so songs from both playlists and all genres are evenly shuffled
      rawItems.sort(
        (a, b) =>
          (randomWeightRef.current[a.videoId] ?? 0) -
          (randomWeightRef.current[b.videoId] ?? 0)
      );

      const combined: PlaylistTrack[] = rawItems.map((item, unifiedIndex) => {
        const override = getOverride(unifiedIndex, item.videoId);
        const cachedTitle = titleCacheRef.current[item.videoId];
        return {
          index: unifiedIndex,
          videoId: item.videoId,
          playlistId: item.playlistId,
          playlistIndex: item.playlistIndex,
          playlistLabel: item.playlistLabel,
          title: override?.title || cachedTitle || `Track ${unifiedIndex + 1}`,
          bpm: override?.bpm ?? 120,
          offsetSec: override?.offsetSec ?? 0,
        };
      });

      setTracks(combined);
      hydrateTitlesInBatches(combined);

      // Update currentIndex to stay pointing at the active video if already selected
      if (currentVideoIdRef.current) {
        const idx = combined.findIndex((t) => t.videoId === currentVideoIdRef.current);
        if (idx >= 0) setCurrentIndex(idx);
      } else if (
        canCueInitial &&
        combined.length > 0 &&
        !hasUserStartedRef.current &&
        playerRef.current
      ) {
        const first = combined[0];
        setCurrentIndex(0);
        setCurrentVideoId(first.videoId);
        setCurrentTitle(first.title);
        try {
          playerRef.current.cueVideoById(first.videoId);
        } catch {
          // ignore
        }
      }
    },
    [hydrateTitlesInBatches]
  );

  const reshuffleTracks = useCallback(() => {
    setTracks((prev) => {
      if (prev.length === 0) return prev;
      const shuffled = shuffleArray(prev).map((t, idx) => {
        randomWeightRef.current[t.videoId] = idx / prev.length;
        return { ...t, index: idx };
      });
      if (currentVideoIdRef.current) {
        const newIdx = shuffled.findIndex((t) => t.videoId === currentVideoIdRef.current);
        if (newIdx >= 0) setCurrentIndex(newIdx);
      } else if (shuffled[0]) {
        setCurrentIndex(0);
        setCurrentVideoId(shuffled[0].videoId);
        setCurrentTitle(shuffled[0].title);
        try {
          playerRef.current?.cueVideoById(shuffled[0].videoId);
        } catch {
          // ignore
        }
      }
      return shuffled;
    });
  }, []);

  const syncMetadataFromPlayer = useCallback((player: YTPlayerInstance) => {
    try {
      const data = player.getVideoData();
      const vid = data?.video_id || '';
      const rawTitle = data?.title || '';

      if (vid) {
        setCurrentVideoId(vid);
        if (rawTitle) {
          titleCacheRef.current[vid] = rawTitle;
          saveTitleCache(titleCacheRef.current);
          setTracks((prev) =>
            prev.map((t) =>
              t.videoId === vid && !getOverride(t.index, vid)?.title
                ? { ...t, title: rawTitle }
                : t
            )
          );
        }

        const matchedTrack = tracksRef.current.find((t) => t.videoId === vid);
        if (matchedTrack) {
          setCurrentIndex(matchedTrack.index);
        }
      }

      const activeIdx = currentIndexRef.current;
      const override = getOverride(activeIdx, vid);
      if (override?.title) {
        setCurrentTitle(override.title);
      } else if (rawTitle) {
        setCurrentTitle(rawTitle);
      } else if (vid && titleCacheRef.current[vid]) {
        setCurrentTitle(titleCacheRef.current[vid]);
      }

      const dur = player.getDuration();
      if (typeof dur === 'number' && dur > 5) {
        setDurationSec(dur);
      }
    } catch {
      // Player might still be initializing
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let pollTimer: number | null = null;
    const primaryPlaylist = PLAYLIST_OPTIONS[0];
    const secondaryPlaylist = PLAYLIST_OPTIONS[1];
    let primaryIdsCaptured: string[] = [];
    let secondaryIdsCaptured: string[] = [];

    let primaryDone = false;
    let secondaryDone = !secondaryPlaylist;

    const updateMergedLists = () => {
      if (!mounted) return;
      const lists: { playlistId: string; label: string; ids: string[] }[] = [];
      if (primaryIdsCaptured.length > 0) {
        lists.push({
          playlistId: primaryPlaylist.id,
          label: primaryPlaylist.label,
          ids: primaryIdsCaptured,
        });
      }
      if (secondaryIdsCaptured.length > 0 && secondaryPlaylist) {
        lists.push({
          playlistId: secondaryPlaylist.id,
          label: secondaryPlaylist.label,
          ids: secondaryIdsCaptured,
        });
      }
      if (lists.length > 0) {
        // Only cue the initial shuffled track once primary playlist IDs are secured
        const canCue = primaryDone && secondaryDone;
        buildCombinedTracks(lists, canCue);
      }
    };

    const initPlayer = () => {
      if (!mounted || !window.YT?.Player) return;
      const host = document.getElementById(containerId);
      if (!host) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }

      setPlaybackState('loading');
      setTracks([]);
      setCurrentIndex(0);
      setCurrentTitle('Loading & shuffling playlists...');
      setErrorMessage(null);
      setSkipNotice(null);
      consecutiveErrorsRef.current = 0;

      // Independently fetch both playlists with retry so neither race cancels the other
      fetchPlaylistIdsWithRetry(primaryPlaylist.id).then((ids) => {
        if (!mounted) return;
        primaryDone = true;
        if (ids.length > 0 && primaryIdsCaptured.length === 0) {
          primaryIdsCaptured = ids;
        }
        updateMergedLists();
      });

      if (secondaryPlaylist) {
        fetchPlaylistIdsWithRetry(secondaryPlaylist.id).then((ids) => {
          if (!mounted) return;
          secondaryDone = true;
          if (ids.length > 0) {
            secondaryIdsCaptured = ids;
          }
          updateMergedLists();
        });
      }

      playerRef.current = new window.YT.Player(containerId, {
        width: '100%',
        height: '100%',
        playerVars: {
          listType: 'playlist',
          list: primaryPlaylist.id,
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            const player = event.target;
            try {
              player.cuePlaylist({
                list: primaryPlaylist.id,
                listType: 'playlist',
                index: 0,
              });
            } catch {
              try {
                player.loadPlaylist({
                  list: primaryPlaylist.id,
                  listType: 'playlist',
                });
              } catch {
                // ignore
              }
            }

            setPlaybackState('ready');
            let attempts = 0;
            pollTimer = window.setInterval(() => {
              if (!mounted) return;
              attempts++;
              const ids = player.getPlaylist();
              if (ids && ids.length > 0) {
                primaryIdsCaptured = ids;
                primaryDone = true;
                updateMergedLists();
                syncMetadataFromPlayer(player);
                if (pollTimer !== null) {
                  clearInterval(pollTimer);
                  pollTimer = null;
                }
              } else if (attempts > 25) {
                primaryDone = true;
                if (pollTimer !== null) {
                  clearInterval(pollTimer);
                  pollTimer = null;
                }
              }
            }, 300);
          },
          onStateChange: (event) => {
            if (!mounted || !window.YT) return;

            const player = event.target;
            const state = event.data;
            const PS = window.YT.PlayerState;

            if (primaryIdsCaptured.length === 0) {
              const ids = player.getPlaylist();
              if (ids && ids.length > 0) {
                primaryIdsCaptured = ids;
                primaryDone = true;
                updateMergedLists();
              }
            }

            if (isGatewayLockedRef.current && state === PS.PLAYING) {
              try {
                player.pauseVideo();
              } catch {
                // ignore
              }
              return;
            }

            syncMetadataFromPlayer(player);

            if (state === PS.PLAYING) {
              hasUserStartedRef.current = true;
              endedGuardRef.current = false;
              consecutiveErrorsRef.current = 0;
              setPlaybackState('playing');
              setErrorMessage(null);
              setSkipNotice(null);
            } else if (state === PS.PAUSED) {
              setPlaybackState('paused');
            } else if (state === PS.BUFFERING) {
              setPlaybackState('buffering');
            } else if (state === PS.CUED) {
              endedGuardRef.current = false;
              setPlaybackState('ready');
            } else if (state === PS.ENDED) {
              setPlaybackState('ended');
              if (!endedGuardRef.current) {
                endedGuardRef.current = true;
                try {
                  player.pauseVideo();
                } catch {
                  // ignore
                }
                onSongEndedRef.current();
              }
            }
          },
          onError: (event) => {
            if (!mounted) return;
            const code = event.data;
            const unlockedTracks = tracksRef.current.filter((t) =>
              unlockedVideoIdsRef.current.has(t.videoId)
            );
            const totalUnlocked = unlockedTracks.length;

            consecutiveErrorsRef.current += 1;

            const isRestricted = code === 101 || code === 150;
            const noticeText = isRestricted
              ? 'Song restricted by YouTube, skipping to next track...'
              : 'Song unavailable on YouTube, skipping to next track...';

            if (totalUnlocked > 1 && consecutiveErrorsRef.current < totalUnlocked) {
              setSkipNotice(noticeText);
              setErrorMessage(null);
              setPlaybackState('buffering');

              if (skipTimeoutRef.current !== null) {
                clearTimeout(skipTimeoutRef.current);
              }
              skipTimeoutRef.current = window.setTimeout(() => {
                if (!mounted || !playerRef.current) return;
                const pos = unlockedTracks.findIndex(
                  (t) => t.videoId === currentVideoIdRef.current
                );
                const nextTrack =
                  pos >= 0
                    ? unlockedTracks[(pos + 1) % unlockedTracks.length]
                    : unlockedTracks[0];
                if (!nextTrack) return;

                endedGuardRef.current = false;
                setCurrentIndex(nextTrack.index);
                setCurrentVideoId(nextTrack.videoId);
                setCurrentTitle(nextTrack.title);
                try {
                  playerRef.current.loadVideoById(nextTrack.videoId);
                } catch {
                  // ignore
                }
              }, 1400);
            } else {
              setSkipNotice(null);
              setPlaybackState('error');
              setErrorMessage(
                tracksRef.current.length === 0
                  ? 'Could not load tracks from the YouTube playlists.'
                  : 'All currently unlocked tracks restricted embedded playback.'
              );
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      mounted = false;
      if (pollTimer !== null) clearInterval(pollTimer);
      if (skipTimeoutRef.current !== null) clearTimeout(skipTimeoutRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [containerId, buildCombinedTracks, syncMetadataFromPlayer]);

  const playVideoAt = useCallback(
    (unifiedIndex: number) => {
      const player = playerRef.current;
      const track = tracksRef.current[unifiedIndex];
      if (!player || !track) return;

      hasUserStartedRef.current = true;
      if (skipTimeoutRef.current !== null) {
        clearTimeout(skipTimeoutRef.current);
        skipTimeoutRef.current = null;
      }
      endedGuardRef.current = false;
      consecutiveErrorsRef.current = 0;
      setErrorMessage(null);
      setSkipNotice(null);
      setCurrentIndex(track.index);
      setCurrentVideoId(track.videoId);
      setCurrentTitle(track.title);

      try {
        player.loadVideoById(track.videoId);
        syncMetadataFromPlayer(player);
      } catch {
        // ignore
      }
    },
    [syncMetadataFromPlayer]
  );

  const play = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    hasUserStartedRef.current = true;
    endedGuardRef.current = false;
    setSkipNotice(null);
    try {
      const vid = currentVideoIdRef.current;
      const loadedVid = player.getVideoData()?.video_id;
      if (vid && loadedVid && vid !== loadedVid) {
        player.loadVideoById(vid);
      } else {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.pauseVideo();
    } catch {
      // ignore
    }
  }, []);

  const restartTrack = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    hasUserStartedRef.current = true;
    endedGuardRef.current = false;
    setSkipNotice(null);
    try {
      player.seekTo(0, true);
      player.playVideo();
    } catch {
      // ignore
    }
  }, []);

  const getCurrentTime = useCallback((): number => {
    const player = playerRef.current;
    if (!player || typeof player.getCurrentTime !== 'function') return 0;
    try {
      return player.getCurrentTime() || 0;
    } catch {
      return 0;
    }
  }, []);

  return {
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
  };
}
