import { useState, useEffect } from 'react';
interface TypedState {
  displayText: string;
  isTyping: boolean;
}
export function useTyped(
  phrases: string[],
  typingSpeed: number = 100,
  pauseDelay: number = 3000,
  deleteSpeed: number = 50
): TypedState {
  const [displayText, setDisplayText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const currentPhrase = phrases[currentPhraseIndex] || '';
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isDeleting && charIndex < currentPhrase.length) {
      setIsTyping(true);
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, typingSpeed);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      setIsTyping(false);
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
    } else if (isDeleting && charIndex > 0) {
      setIsTyping(true);
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, deleteSpeed);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setIsTyping(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      timeout = setTimeout(() => {
        setCharIndex(0);
        setIsTyping(true);
      }, 200);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, currentPhrase, isDeleting, phrases.length, typingSpeed, pauseDelay, deleteSpeed]);
  return { displayText, isTyping };
}