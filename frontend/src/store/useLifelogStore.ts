import { create } from "zustand";

import { Lifelog } from "@/types/lifelogTypes";

interface LifelogState {
  lifelog: Lifelog | null;
  setLifelog: (lifelog: Lifelog) => void;
}

const useLifelogStore = create<LifelogState>((set) => ({
  lifelog: null,
  setLifelog: (lifelog) => set({ lifelog }),
}));

export default useLifelogStore;
