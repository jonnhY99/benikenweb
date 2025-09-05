export const createStorage = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    return JSON.parse(storedValue);
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

export const getStorage = (key) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
};

export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};