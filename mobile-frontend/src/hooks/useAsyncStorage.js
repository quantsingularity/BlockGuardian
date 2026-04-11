import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

const useAsyncStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        const item = await AsyncStorage.getItem(key);
        const value = item ? JSON.parse(item) : initialValueRef.current;
        setStoredValue(value);
        setError(null);
      } catch (e) {
        console.error("Error loading from AsyncStorage:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  const setValue = async (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.error("Error saving to AsyncStorage:", e);
      setError(e);
    }
  };

  const removeValue = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
    } catch (e) {
      console.error("Error removing from AsyncStorage:", e);
      setError(e);
    }
  };

  return [storedValue, setValue, { removeValue, isLoading, error }];
};

export default useAsyncStorage;
