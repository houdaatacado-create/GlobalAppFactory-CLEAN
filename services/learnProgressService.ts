// Powered by OnSpace.AI
// Learn Islam — Lesson progress persistence (AsyncStorage)

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'learn_progress_v1';

export interface LessonProgressRecord {
  completedAt: number; // timestamp ms
}

export type LessonProgressMap = Record<string, LessonProgressRecord>;

// ─── Core I/O ────────────────────────────────────────────────────────────────

export async function loadProgress(): Promise<LessonProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LessonProgressMap;
  } catch {
    return {};
  }
}

async function saveProgress(map: LessonProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // non-fatal
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function markLessonComplete(lessonId: string): Promise<LessonProgressMap> {
  const map = await loadProgress();
  map[lessonId] = { completedAt: Date.now() };
  await saveProgress(map);
  return map;
}

export async function markLessonIncomplete(lessonId: string): Promise<LessonProgressMap> {
  const map = await loadProgress();
  delete map[lessonId];
  await saveProgress(map);
  return map;
}

// ─── Selectors ───────────────────────────────────────────────────────────────

export function isLessonCompleted(map: LessonProgressMap, lessonId: string): boolean {
  return !!map[lessonId];
}

/** Returns { completed, total } for a given categoryId. */
export function getCategoryProgress(
  map: LessonProgressMap,
  lessonIds: string[]
): { completed: number; total: number } {
  const total = lessonIds.length;
  const completed = lessonIds.filter(id => !!map[id]).length;
  return { completed, total };
}
