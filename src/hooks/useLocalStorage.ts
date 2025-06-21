import { useState, useEffect } from 'react';

// Date reviver function to convert ISO date strings back to Date objects
function dateReviver(key: string, value: any) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, dateReviver) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    let valueToStore: T;
    
    try {
      valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Try to save to localStorage first
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Only update React state if localStorage save was successful
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      
      // Handle quota exceeded error specifically
      if (error instanceof DOMException && (
        error.code === 22 || // QUOTA_EXCEEDED_ERR
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        // Calculate approximate size of data being stored
        const dataSize = new Blob([JSON.stringify(valueToStore)]).size;
        const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
        
        alert(
          `Storage quota exceeded!\n\n` +
          `The data you're trying to save (${dataSizeMB} MB) exceeds your browser's storage limit.\n\n` +
          `To resolve this:\n` +
          `• Use smaller question files (split large files into smaller ones)\n` +
          `• Avoid base64-encoded images - use external URLs instead\n` +
          `• Clear existing data using the "Clear Data" button in the dashboard\n` +
          `• Consider using fewer questions per upload\n\n` +
          `Your current upload was not saved.`
        );
      }
      
      // Don't update the state if storage failed
      return;
    }
  };

  return [storedValue, setValue] as const;
}