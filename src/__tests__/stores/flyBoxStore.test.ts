import { useFlyBoxStore } from '../../stores/flyBoxStore';

// Reset store before each test
beforeEach(() => {
  useFlyBoxStore.setState({ items: [] });
});

describe('flyBoxStore', () => {
  describe('addFly', () => {
    it('adds a new fly to the box', () => {
      const { addFly, items } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Elk Hair Caddis',
        flyType: 'dry',
        size: '14',
        quantity: 2,
        addedFrom: 'Yakima River',
      });

      const updatedItems = useFlyBoxStore.getState().items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].flyName).toBe('Elk Hair Caddis');
      expect(updatedItems[0].flyType).toBe('dry');
      expect(updatedItems[0].size).toBe('14');
      expect(updatedItems[0].quantity).toBe(2);
      expect(updatedItems[0].addedFrom).toBe('Yakima River');
      expect(updatedItems[0].id).toBeDefined();
      expect(updatedItems[0].addedAt).toBeDefined();
    });

    it('increments quantity when adding duplicate fly', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Pheasant Tail',
        flyType: 'nymph',
        size: '16',
        quantity: 2,
      });

      addFly({
        flyName: 'Pheasant Tail',
        flyType: 'nymph',
        size: '16',
        quantity: 3,
      });

      const updatedItems = useFlyBoxStore.getState().items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].quantity).toBe(5);
    });

    it('treats different sizes as separate items', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Adams',
        flyType: 'dry',
        size: '14',
        quantity: 2,
      });

      addFly({
        flyName: 'Adams',
        flyType: 'dry',
        size: '16',
        quantity: 2,
      });

      const updatedItems = useFlyBoxStore.getState().items;
      expect(updatedItems).toHaveLength(2);
    });

    it('handles case-insensitive fly name matching', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Woolly Bugger',
        flyType: 'streamer',
        size: '8',
        quantity: 2,
      });

      addFly({
        flyName: 'woolly bugger',
        flyType: 'streamer',
        size: '8',
        quantity: 1,
      });

      const updatedItems = useFlyBoxStore.getState().items;
      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].quantity).toBe(3);
    });
  });

  describe('removeFly', () => {
    it('removes a fly from the box', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Blue Wing Olive',
        flyType: 'dry',
        size: '18',
        quantity: 3,
      });

      const itemsAfterAdd = useFlyBoxStore.getState().items;
      expect(itemsAfterAdd).toHaveLength(1);

      const { removeFly } = useFlyBoxStore.getState();
      removeFly(itemsAfterAdd[0].id);

      const itemsAfterRemove = useFlyBoxStore.getState().items;
      expect(itemsAfterRemove).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity of a fly', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Hares Ear',
        flyType: 'nymph',
        size: '14',
        quantity: 2,
      });

      const itemsAfterAdd = useFlyBoxStore.getState().items;
      const { updateQuantity } = useFlyBoxStore.getState();
      updateQuantity(itemsAfterAdd[0].id, 5);

      const itemsAfterUpdate = useFlyBoxStore.getState().items;
      expect(itemsAfterUpdate[0].quantity).toBe(5);
    });

    it('removes item when quantity is set to 0', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'San Juan Worm',
        flyType: 'nymph',
        size: '12',
        quantity: 3,
      });

      const itemsAfterAdd = useFlyBoxStore.getState().items;
      const { updateQuantity } = useFlyBoxStore.getState();
      updateQuantity(itemsAfterAdd[0].id, 0);

      const itemsAfterUpdate = useFlyBoxStore.getState().items;
      expect(itemsAfterUpdate).toHaveLength(0);
    });
  });

  describe('clearBox', () => {
    it('removes all flies from the box', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({ flyName: 'Fly 1', flyType: 'dry', size: '14', quantity: 1 });
      addFly({ flyName: 'Fly 2', flyType: 'nymph', size: '16', quantity: 2 });
      addFly({ flyName: 'Fly 3', flyType: 'streamer', size: '6', quantity: 1 });

      expect(useFlyBoxStore.getState().items).toHaveLength(3);

      const { clearBox } = useFlyBoxStore.getState();
      clearBox();

      expect(useFlyBoxStore.getState().items).toHaveLength(0);
    });
  });

  describe('isInBox', () => {
    it('returns true when fly is in the box', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Stimulator',
        flyType: 'dry',
        size: '10',
        quantity: 2,
      });

      const { isInBox } = useFlyBoxStore.getState();
      expect(isInBox('Stimulator', '10')).toBe(true);
    });

    it('returns false when fly is not in the box', () => {
      const { isInBox } = useFlyBoxStore.getState();
      expect(isInBox('Nonexistent Fly', '14')).toBe(false);
    });

    it('returns false when size does not match', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({
        flyName: 'Stimulator',
        flyType: 'dry',
        size: '10',
        quantity: 2,
      });

      const { isInBox } = useFlyBoxStore.getState();
      expect(isInBox('Stimulator', '12')).toBe(false);
    });
  });

  describe('getItemCount', () => {
    it('returns total quantity of all flies', () => {
      const { addFly } = useFlyBoxStore.getState();

      addFly({ flyName: 'Fly 1', flyType: 'dry', size: '14', quantity: 2 });
      addFly({ flyName: 'Fly 2', flyType: 'nymph', size: '16', quantity: 3 });
      addFly({ flyName: 'Fly 3', flyType: 'streamer', size: '6', quantity: 1 });

      const { getItemCount } = useFlyBoxStore.getState();
      expect(getItemCount()).toBe(6);
    });

    it('returns 0 for empty box', () => {
      const { getItemCount } = useFlyBoxStore.getState();
      expect(getItemCount()).toBe(0);
    });
  });
});
