import { create } from "zustand";

import { Status } from "@/types/statusTypes";

interface StatusState {
  status: Status;
  setStatus: (status: Status) => void;
  playerId: string | null;
  setPlayerId: (playerId: string | null) => void;
  clearStatus: () => void;
}

const useStatusStore = create<StatusState>((set) => ({
  status: Status.VOID,
  playerId: null,
  setStatus: (status) => {
    set((state) => {
      if (status === Status.RECORDING) {
        return { status, playerId: null };
      } else if (state.status === Status.END) {
        // if end, do not change status
        return {};
      } else {
        return { status };
      }
    });
  },
  setPlayerId: (playerId) => {
    set({ playerId });
  },
  clearStatus: () => set({ status: Status.VOID }),
}));

export default useStatusStore;
