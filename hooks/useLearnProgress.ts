// Powered by OnSpace.AI
// Learn Progress Hook — loads/saves lesson progress, exposes toggle + selectors
import { useState, useEffect, useCallback } from 'react';
import {
  loadProgress, markLessonComplete, markLessonIncomplete,
  isLessonCompleted, getCategoryProgress, LessonProgressMap,
} from '../services/learnProgressService';
import { getLessonsForCategory } from '../services/learnService';

export function useLearnProgress() {
  const [progressMap, setProgressMap] = useState<LessonProgressMap>({});
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadProgress().then(map => {
      setProgressMap(map);
      setLoaded(true);
    });
  }, []);

  // Toggle a lesson complete / incomplete
  const toggleLesson = useCallback(async (lessonId: string) => {
    const isCurrentlyDone = isLessonCompleted(progressMap, lessonId);
    const updated = isCurrentlyDone
      ? await markLessonIncomplete(lessonId)
      : await markLessonComplete(lessonId);
    setProgressMap({ ...updated });
    return !isCurrentlyDone; // returns new state (true = just completed)
  }, [progressMap]);

  // Mark a lesson complete explicitly (no toggle)
  const completeLesson = useCallback(async (lessonId: string) => {
    const updated = await markLessonComplete(lessonId);
    setProgressMap({ ...updated });
  }, []);

  // Helpers
  const isCompleted = useCallback(
    (lessonId: string) => isLessonCompleted(progressMap, lessonId),
    [progressMap]
  );

  const categoryProgress = useCallback(
    (categoryId: string) => {
      const lessons = getLessonsForCategory(categoryId);
      return getCategoryProgress(progressMap, lessons.map(l => l.id));
    },
    [progressMap]
  );

  return {
    progressMap,
    loaded,
    toggleLesson,
    completeLesson,
    isCompleted,
    categoryProgress,
  };
}
