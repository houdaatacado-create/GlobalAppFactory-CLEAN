// Powered by OnSpace.AI
import { useContext } from 'react';
import { QuranAudioContext } from '../contexts/QuranAudioContext';

export function useQuranAudio() {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error('useQuranAudio must be used within QuranAudioProvider');
  return ctx;
}
