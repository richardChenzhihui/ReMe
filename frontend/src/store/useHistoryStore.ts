import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import { Message, MessageContent, Mode, Role } from "@/types/messageTypes";

interface HistoryState {
  sessionId: string | undefined;
  history: Message[];
  pendingMessages: Message[];
  setSessionId: (sessionId: string) => void;
  initSession: (
    sessionId: string,
    role: Role,
    content: MessageContent,
    mode?: Mode,
  ) => string;
  addMessage: (role: Role, content: MessageContent, mode?: Mode) => string;
  addPendingMessage: (
    role: Role,
    content: MessageContent,
    mode?: Mode,
  ) => string;
  shiftPendingMessage: () => void;
  updateMessage: (id: string, newContent: MessageContent) => void;
  clearHistory: () => void;
}

const useHistoryStore = create<HistoryState>()((set) => ({
  sessionId: undefined,
  history: [],
  pendingMessages: [],
  setSessionId: (sessionId) => set(() => ({ sessionId })),
  initSession: (sessionId, role, content, mode) => {
    const id = uuidv4();
    set(() => ({
      sessionId: sessionId,
      history: [{ id, role, mode, ...content }],
      pendingMessages: [],
    }));
    return id;
  },
  addMessage: (role, content, mode) => {
    const id = uuidv4();
    set((state) => ({
      history: [...state.history, { id, role, mode, ...content }],
    }));
    return id;
  },
  updateMessage: (id, newContent) => {
    set((state) => {
      const newHistory = [...state.history];
      const index = newHistory.findIndex((message) => message.id === id);
      if (index >= 0) {
        newHistory[index] = {
          ...newHistory[index],
          ...newContent,
        };
      }
      return {
        history: newHistory,
      };
    });
  },
  addPendingMessage: (role, content, mode) => {
    const id = uuidv4();
    set((state) => ({
      pendingMessages: [
        ...state.pendingMessages,
        { id, role, mode, ...content },
      ],
    }));
    return id;
  },
  shiftPendingMessage: () => {
    set((state) => {
      const newPendingMessages = [...state.pendingMessages];
      const message = newPendingMessages.shift();
      if (!message) return {};
      return {
        history: [...state.history, message],
        pendingMessages: newPendingMessages,
      };
    });
  },
  clearHistory: () =>
    set(() => ({
      sessionId: undefined,
      history: [],
    })),
}));
export default useHistoryStore;
