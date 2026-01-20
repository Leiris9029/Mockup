import { useState, useEffect, useCallback } from 'react';

interface UseStreamingTextOptions {
  text: string;
  enabled: boolean;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
}

export function useStreamingText({
  text,
  enabled,
  speed = 20,
  onComplete,
}: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, enabled, speed, onComplete]);

  const skipToEnd = useCallback(() => {
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  return { displayedText, isComplete, skipToEnd };
}
