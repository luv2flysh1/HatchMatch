import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FlyBoxItem {
  id: string;
  flyName: string;
  flyType: string;
  size: string;
  quantity: number;
  addedFrom?: string; // Water body name where this was recommended
  addedAt: Date;
  notes?: string;
}

export interface FlyShop {
  id: string;
  name: string;
  address?: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  distance?: number;
}

interface FlyBoxState {
  // Data
  items: FlyBoxItem[];

  // Actions
  addFly: (fly: Omit<FlyBoxItem, 'id' | 'addedAt'>) => void;
  removeFly: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearBox: () => void;
  isInBox: (flyName: string, size: string) => boolean;
  getItemCount: () => number;
}

export const useFlyBoxStore = create<FlyBoxState>()(
  persist(
    (set, get) => ({
      items: [],

      addFly: (fly) => {
        const { items } = get();

        // Check if fly already exists with same name and size
        const existingIndex = items.findIndex(
          (item) => item.flyName.toLowerCase() === fly.flyName.toLowerCase() && item.size === fly.size
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + (fly.quantity || 1),
          };
          set({ items: updated });
        } else {
          // Add new item
          const newItem: FlyBoxItem = {
            ...fly,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            quantity: fly.quantity || 1,
            addedAt: new Date(),
          };
          set({ items: [...items, newItem] });
        }
      },

      removeFly: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFly(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      updateNotes: (id, notes) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        });
      },

      clearBox: () => {
        set({ items: [] });
      },

      isInBox: (flyName, size) => {
        return get().items.some(
          (item) => item.flyName.toLowerCase() === flyName.toLowerCase() && item.size === size
        );
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'fly-box-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Online fly shop vendors
export const ONLINE_SHOPS = [
  {
    id: 'orvis',
    name: 'Orvis',
    website: 'https://www.orvis.com/flies',
    description: 'Premium flies and fly fishing gear',
  },
  {
    id: 'cabelas',
    name: "Cabela's",
    website: 'https://www.cabelas.com/shop/en/fly-fishing-flies',
    description: 'Wide selection at competitive prices',
  },
  {
    id: 'flyfishfood',
    name: 'Fly Fish Food',
    website: 'https://flyfishfood.com',
    description: 'Modern fly patterns and tying materials',
  },
  {
    id: 'madriveroutfitters',
    name: 'Mad River Outfitters',
    website: 'https://www.madriveroutfitters.com/flies.html',
    description: 'Great selection of proven patterns',
  },
  {
    id: 'theflystop',
    name: 'The Fly Stop',
    website: 'https://www.theflystop.com',
    description: 'Quality flies at reasonable prices',
  },
];
