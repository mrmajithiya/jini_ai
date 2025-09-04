import { auth, realtimeDb } from "../lib/firebase"; // adjust path if needed
import { ref, push, set } from "firebase/database";

/** Use LOCAL timezone (not UTC) to avoid wrong buckets around midnight */
export const getTodayKey = () =>
  new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

/** Create a new chat session bucket for today.
 *  - If logged in → users/{uid}/chats/{YYYY-MM-DD}/{sessionId}
 *  - If guest → guestChats/{YYYY-MM-DD}/{sessionId}
 */
export const createChatSession = async (title?: string) => {
  const dateKey = getTodayKey();
  const user = auth.currentUser;

  // Parent path for sessions under today's bucket
  const basePath = user
    ? `users/${user.uid}/chats/${dateKey}`
    : `guestChats/${dateKey}`;

  // Create a new session id under the day
  const sessionRef = push(ref(realtimeDb, basePath));
  const sessionId = sessionRef.key as string;
  const sessionPath = `${basePath}/${sessionId}`;

  // Optional metadata for the session
  await set(ref(realtimeDb, sessionPath + "/meta"), {
    title: title || "New chat",
    startedAt: Date.now(),
  });

  return { sessionId, sessionPath, dateKey };
};

/** Append a single message to the session (user or bot) */
export const appendMessage = async (
  sessionPath: string,
  role: "user" | "bot",
  text: string
) => {
  const messagesRef = ref(realtimeDb, `${sessionPath}/messages`);
  const msgRef = push(messagesRef);
  await set(msgRef, {
    role,
    text,
    timestamp: Date.now(),
  });
};

/** Convenience helper: store one user turn and the bot response */
export const saveTurn = async (
  sessionPath: string,
  userText: string,
  botText: string
) => {
  await appendMessage(sessionPath, "user", userText);
  await appendMessage(sessionPath, "bot", botText);
};
