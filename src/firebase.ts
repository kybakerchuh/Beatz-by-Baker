import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  Auth,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import appletFirebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Allow GitHub / local deployments to override via VITE_FIREBASE_* env vars if desired
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletFirebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId,
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID || appletFirebaseConfig.firestoreDatabaseId,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export interface StudentProgressRecord {
  uid: string;
  displayName: string;
  unlockedVideoIds: string[];
  passedVideoIds: string[];
  availableUnlocks: number;
  ostCorrectCount: number;
  ostTotalAttempts: number;
  createdAt?: Timestamp | null;
}

export interface LeaderboardEntryRecord {
  uid: string;
  displayName: string;
  photoURL?: string;
  ostCorrectCount: number;
  ostTotalAttempts: number;
  bestSingleScore: number;
  totalHighScore: number;
  songsPlayedCount: number;
  isPublic: boolean;
}

export interface SongHighScoreRecord {
  id: string;
  userId: string;
  displayName: string;
  videoId: string;
  songTitle: string;
  highScore: number;
  maxCombo: number;
  accuracy: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isPublic: boolean;
}

function sanitizeDisplayName(user: User): string {
  const raw = (user.displayName || user.email?.split('@')[0] || 'Student').trim();
  return (raw || 'Student').slice(0, 80);
}

function sanitizeVideoIds(ids: string[]): string[] {
  const validPattern = /^[a-zA-Z0-9_-]{1,32}$/;
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id === 'string' && validPattern.test(id) && !seen.has(id)) {
      seen.add(id);
      unique.push(id);
      if (unique.length >= 300) break;
    }
  }
  return unique;
}

export async function loadStudentProgress(
  user: User
): Promise<StudentProgressRecord | null> {
  if (!db) return null;
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: String(data.uid || user.uid),
      displayName: String(data.displayName || sanitizeDisplayName(user)),
      unlockedVideoIds: Array.isArray(data.unlockedVideoIds)
        ? sanitizeVideoIds(data.unlockedVideoIds)
        : [],
      passedVideoIds: Array.isArray(data.passedVideoIds)
        ? sanitizeVideoIds(data.passedVideoIds)
        : [],
      availableUnlocks: Math.max(0, Math.min(500, Math.floor(Number(data.availableUnlocks) || 0))),
      ostCorrectCount: Math.max(0, Math.min(100000, Math.floor(Number(data.ostCorrectCount) || 0))),
      ostTotalAttempts: Math.max(0, Math.min(100000, Math.floor(Number(data.ostTotalAttempts) || 0))),
      createdAt: data.createdAt || null,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStudentProgress(
  user: User,
  progress: {
    unlockedVideoIds: string[];
    passedVideoIds: string[];
    availableUnlocks: number;
    ostCorrectCount: number;
    ostTotalAttempts: number;
  }
): Promise<void> {
  if (!db) return;
  const userPath = `users/${user.uid}`;
  const displayName = sanitizeDisplayName(user);
  const cleanIds = sanitizeVideoIds(progress.unlockedVideoIds);
  const cleanPassedIds = sanitizeVideoIds(progress.passedVideoIds);
  const availableUnlocks = Math.max(0, Math.min(500, Math.floor(progress.availableUnlocks)));
  const ostCorrectCount = Math.max(0, Math.min(100000, Math.floor(progress.ostCorrectCount)));
  const ostTotalAttempts = Math.max(0, Math.min(100000, Math.floor(progress.ostTotalAttempts)));

  try {
    const ref = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        displayName,
        unlockedVideoIds: cleanIds,
        passedVideoIds: cleanPassedIds,
        availableUnlocks,
        ostCorrectCount,
        ostTotalAttempts,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        ref,
        {
          uid: user.uid,
          displayName,
          unlockedVideoIds: cleanIds,
          passedVideoIds: cleanPassedIds,
          availableUnlocks,
          ostCorrectCount,
          ostTotalAttempts,
          createdAt: existingSnap.data().createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // Also sync OST stats to public leaderboard entry
  const lbPath = `leaderboard/${user.uid}`;
  try {
    const lbRef = doc(db, 'leaderboard', user.uid);
    const existingLb = await getDoc(lbRef);
    const photoURL = (user.photoURL || '').slice(0, 500);
    if (!existingLb.exists()) {
      await setDoc(lbRef, {
        uid: user.uid,
        displayName,
        ...(photoURL ? { photoURL } : {}),
        ostCorrectCount,
        ostTotalAttempts,
        bestSingleScore: 0,
        totalHighScore: 0,
        songsPlayedCount: 0,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = existingLb.data();
      await setDoc(
        lbRef,
        {
          uid: user.uid,
          displayName,
          ...(photoURL ? { photoURL } : {}),
          ostCorrectCount,
          ostTotalAttempts,
          bestSingleScore: Math.max(0, Math.floor(Number(prev.bestSingleScore) || 0)),
          totalHighScore: Math.max(0, Math.floor(Number(prev.totalHighScore) || 0)),
          songsPlayedCount: Math.max(0, Math.floor(Number(prev.songsPlayedCount) || 0)),
          isPublic: true,
          createdAt: prev.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export async function recordSongScoreToLeaderboard({
  user,
  videoId,
  songTitle,
  score,
  maxCombo,
  accuracy,
  difficulty,
  ostCorrectCount,
  ostTotalAttempts,
}: {
  user: User;
  videoId: string;
  songTitle: string;
  score: number;
  maxCombo: number;
  accuracy: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  ostCorrectCount: number;
  ostTotalAttempts: number;
}): Promise<void> {
  if (!db) return;
  const cleanVid = videoId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  if (!cleanVid) return;

  const displayName = sanitizeDisplayName(user);
  const cleanTitle = (songTitle || 'Untitled Track').trim().slice(0, 160) || 'Untitled Track';
  const cleanScore = Math.max(0, Math.min(10000000, Math.floor(score)));
  const cleanCombo = Math.max(0, Math.min(50000, Math.floor(maxCombo)));
  const cleanAcc = Math.max(0, Math.min(100, Math.floor(accuracy)));

  const scoreId = `${cleanVid}__${user.uid}`;
  const scorePath = `songScores/${scoreId}`;

  try {
    const scoreRef = doc(db, 'songScores', scoreId);
    const existingSnap = await getDoc(scoreRef);

    if (!existingSnap.exists()) {
      await setDoc(scoreRef, {
        userId: user.uid,
        displayName,
        videoId: cleanVid,
        songTitle: cleanTitle,
        highScore: cleanScore,
        maxCombo: cleanCombo,
        accuracy: cleanAcc,
        difficulty,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = existingSnap.data();
      const prevBest = Math.floor(Number(prev.highScore) || 0);
      if (cleanScore >= prevBest) {
        await setDoc(
          scoreRef,
          {
            userId: user.uid,
            displayName,
            videoId: cleanVid,
            songTitle: cleanTitle,
            highScore: cleanScore,
            maxCombo: Math.max(cleanCombo, Math.floor(Number(prev.maxCombo) || 0)),
            accuracy: Math.max(cleanAcc, Math.floor(Number(prev.accuracy) || 0)),
            difficulty,
            isPublic: true,
            createdAt: prev.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, scorePath);
  }

  // Recompute student's totalHighScore & bestSingleScore across all their played songs
  const myScoresPath = 'songScores';
  let bestSingleScore = cleanScore;
  let totalHighScore = cleanScore;
  let songsPlayedCount = 1;

  try {
    const q = query(
      collection(db, 'songScores'),
      where('userId', '==', user.uid),
      where('isPublic', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      let sum = 0;
      let max = 0;
      snap.forEach((d) => {
        const hs = Math.max(0, Math.floor(Number(d.data().highScore) || 0));
        sum += hs;
        if (hs > max) max = hs;
      });
      bestSingleScore = max;
      totalHighScore = sum;
      songsPlayedCount = snap.size;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, myScoresPath);
  }

  const lbPath = `leaderboard/${user.uid}`;
  try {
    const lbRef = doc(db, 'leaderboard', user.uid);
    const existingLb = await getDoc(lbRef);
    const photoURL = (user.photoURL || '').slice(0, 500);
    const payload = {
      uid: user.uid,
      displayName,
      ...(photoURL ? { photoURL } : {}),
      ostCorrectCount: Math.max(0, Math.min(100000, Math.floor(ostCorrectCount))),
      ostTotalAttempts: Math.max(0, Math.min(100000, Math.floor(ostTotalAttempts))),
      bestSingleScore: Math.min(10000000, bestSingleScore),
      totalHighScore: Math.min(500000000, totalHighScore),
      songsPlayedCount: Math.min(1000, songsPlayedCount),
      isPublic: true,
      createdAt: existingLb.exists() ? existingLb.data().createdAt || serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(lbRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export async function fetchLeaderboardData(): Promise<{
  students: LeaderboardEntryRecord[];
  songScores: SongHighScoreRecord[];
}> {
  if (!db) return { students: [], songScores: [] };

  let students: LeaderboardEntryRecord[] = [];
  let songScores: SongHighScoreRecord[] = [];

  try {
    const lbQ = query(
      collection(db, 'leaderboard'),
      where('isPublic', '==', true),
      limit(100)
    );
    const lbSnap = await getDocs(lbQ);
    students = lbSnap.docs.map((d) => {
      const data = d.data();
      return {
        uid: String(data.uid || d.id),
        displayName: String(data.displayName || 'Student'),
        photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
        ostCorrectCount: Number(data.ostCorrectCount) || 0,
        ostTotalAttempts: Number(data.ostTotalAttempts) || 0,
        bestSingleScore: Number(data.bestSingleScore) || 0,
        totalHighScore: Number(data.totalHighScore) || 0,
        songsPlayedCount: Number(data.songsPlayedCount) || 0,
        isPublic: Boolean(data.isPublic),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leaderboard');
  }

  try {
    const ssQ = query(
      collection(db, 'songScores'),
      where('isPublic', '==', true),
      limit(300)
    );
    const ssSnap = await getDocs(ssQ);
    songScores = ssSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: String(data.userId || ''),
        displayName: String(data.displayName || 'Student'),
        videoId: String(data.videoId || ''),
        songTitle: String(data.songTitle || 'Track'),
        highScore: Number(data.highScore) || 0,
        maxCombo: Number(data.maxCombo) || 0,
        accuracy: Number(data.accuracy) || 0,
        difficulty: (data.difficulty || 'medium') as 'easy' | 'medium' | 'hard' | 'expert',
        isPublic: Boolean(data.isPublic),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'songScores');
  }

  return { students, songScores };
}
