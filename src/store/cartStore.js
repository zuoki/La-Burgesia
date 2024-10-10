// Simple state management using vanilla JavaScript with localStorage persistence
const createStore = (initialState) => {
  let state = JSON.parse(localStorage.getItem('cartState')) || initialState;
  const listeners = new Set();

  const getState = () => state;

  const setState = (newState) => {
    state = { ...state, ...newState };
    localStorage.setItem('cartState', JSON.stringify(state));
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};

const cartStore = createStore({
  items: [],
  total: 0,
});

export const addItem = (newItem) => {
  const { items, total } = cartStore.getState();
  const existingItemIndex = items.findIndex(item => item.name === newItem.name);

  if (existingItemIndex !== -1) {
    // If item exists, increase its quantity
    const updatedItems = items.map((item, index) => 
      index === existingItemIndex 
        ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.price }
        : item
    );
    const newTotal = total + newItem.price;
    cartStore.setState({ items: updatedItems, total: newTotal });
  } else {
    // If item doesn't exist, add it with quantity 1
    const newItems = [...items, { ...newItem, quantity: 1, totalPrice: newItem.price }];
    const newTotal = total + newItem.price;
    cartStore.setState({ items: newItems, total: newTotal });
  }
};

export const removeItem = (itemName) => {
  const { items, total } = cartStore.getState();
  const itemIndex = items.findIndex(item => item.name === itemName);

  if (itemIndex !== -1) {
    const item = items[itemIndex];
    if (item.quantity > 1) {
      // If quantity > 1, decrease quantity by 1
      const updatedItems = items.map((item, index) => 
        index === itemIndex 
          ? { ...item, quantity: item.quantity - 1, totalPrice: (item.quantity - 1) * item.price }
          : item
      );
      const newTotal = total - item.price;
      cartStore.setState({ items: updatedItems, total: newTotal });
    } else {
      // If quantity is 1, remove the item completely
      const newItems = items.filter((_, index) => index !== itemIndex);
      const newTotal = total - item.price;
      cartStore.setState({ items: newItems, total: newTotal });
    }
  }
};

export default cartStore;