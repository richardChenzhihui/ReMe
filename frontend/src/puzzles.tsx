import { GuessIcon, MemoryIcon } from "@c/icons";

export const PUZZLES = [
  {
    name: "Item Guess",
    icon: (className: string) => <GuessIcon className={className} />,
    id: "guess_a_thing",
  },
  {
    name: "Life Recall",
    icon: (className: string) => <MemoryIcon className={className} />,
    id: "life_recall",
  },
];
