import { create } from 'zustand';

export type AnimationType = 'DICE_ROLL' | 'TOKEN_MOVE' | 'PURCHASE_SPARKLE' | 'BUILDING_SPARKLE' | 'LANDMARK_COMPLETE' | 'MORTGAGE_DIM' | 'MONEY_LOSS' | 'MONEY_GAIN';

export interface AnimationEvent {
  id: string;
  type: AnimationType;
  payload?: any;
  onComplete?: () => void;
}

interface AnimationQueueStore {
  queue: AnimationEvent[];
  isAnimating: boolean;
  enqueue: (event: Omit<AnimationEvent, 'id'>) => void;
  dequeue: () => void;
  setAnimating: (isAnimating: boolean) => void;
  clear: () => void;
}

export const useAnimationQueue = create<AnimationQueueStore>((set) => ({
  queue: [],
  isAnimating: false,
  enqueue: (event) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ queue: [...state.queue, { ...event, id }] }));
  },
  dequeue: () => set((state) => {
    const current = state.queue[0];
    if (current && current.onComplete) {
        current.onComplete();
    }
    return { queue: state.queue.slice(1) };
  }),
  setAnimating: (isAnimating) => set({ isAnimating }),
  clear: () => set({ queue: [], isAnimating: false }),
}));
