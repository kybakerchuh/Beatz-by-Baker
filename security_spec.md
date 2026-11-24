# Security Specification — FretMath Firestore Rules

## 1. Data Invariants
1. A `UserProgress` document at `/users/{userId}` can only be read or modified by the authenticated owner (`request.auth.uid == userId`) with a verified email (`email_verified == true`), and never exposes PII to other users.
2. `uid` / `userId` fields in all documents must match `request.auth.uid` on create and remain immutable on update.
3. Every `createdAt` and `updatedAt` field must strictly equal `request.time` on creation, `createdAt` is immutable on update, and `updatedAt == request.time` on update.
4. `unlockedVideoIds` in `UserProgress` is strictly bounded (`<= 300` items), and when non-empty its first element is validated as a bounded string.
5. `LeaderboardEntry` and `SongHighScore` contain zero PII (no email, phone, or address), enforce `isPublic == true`, and can only be created/updated by their matching owner (`request.auth.uid == userId`).
6. All document IDs (`userId`, `scoreId`) must pass `isValidId()` (`^[a-zA-Z0-9_\\-]+$`, `<= 128` chars), and `scoreId` must equal `incoming().videoId + '__' + request.auth.uid`.

## 2. Dirty Dozen Attack Payloads
1. **Unauthenticated Write**: Creating `/users/abc` when `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Creating `/leaderboard/abc` when `email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-User Read (PII/Private Progress)**: Reading `/users/otherUid` as `userA` -> `PERMISSION_DENIED`.
4. **UID Spoofing on Create**: Creating `/users/userA` with `uid: "userB"` -> `PERMISSION_DENIED`.
5. **UID Mutation on Update**: Updating `/songScores/vid__userA` to change `userId` to `"userB"` -> `PERMISSION_DENIED`.
6. **Shadow / Ghost Field Injection**: Creating `/leaderboard/userA` with an extra field `isAdmin: true` -> `PERMISSION_DENIED`.
7. **Timestamp Forgery**: Creating `/users/userA` with a client-provided `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
8. **Immutable Field Modification**: Updating `/users/userA` with a modified `createdAt` -> `PERMISSION_DENIED`.
9. **Oversized String / Resource Poisoning**: Creating `/songScores/vid__userA` with `songTitle` length > 160 chars -> `PERMISSION_DENIED`.
10. **Unbounded Array / Denial of Wallet**: Updating `/users/userA` with `unlockedVideoIds` array size > 300 -> `PERMISSION_DENIED`.
11. **Type Poisoning**: Updating `/leaderboard/userA` with `ostCorrectCount: "9999"` (string instead of int) -> `PERMISSION_DENIED`.
12. **Cross-User Score Tampering**: Updating `/songScores/vid__userB` as `userA` -> `PERMISSION_DENIED`.
