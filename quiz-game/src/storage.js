const KEY = 'quiz-game:progress';
const VERSION = 3;
const MAX_HISTORY = 50;

function emptyProgress() {
  return { version: VERSION, bestScore: 0, totalXp: 0, hintsUsed: 0, history: [] };
}

// v1(버전 필드 없음) 형식: { best, xp, history: [{ score, date }] }
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.version === undefined) {
    return {
      version: VERSION,
      bestScore: raw.best ?? 0,
      totalXp: raw.xp ?? 0,
      hintsUsed: 0,
      history: Array.isArray(raw.history) ? raw.history : [],
    };
  }
  if (raw.version === VERSION) return raw;
  return emptyProgress();
}

export function loadProgress(storage = localStorage) {
  try {
    return migrate(JSON.parse(storage.getItem(KEY) ?? 'null'));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage = localStorage) {
  storage.setItem(KEY, JSON.stringify(progress));
}

/** 게임 결과를 누적 기록에 반영하고 저장합니다. */
export function recordGame(result, storage = localStorage) {
  const progress = loadProgress(storage);
  progress.bestScore = Math.max(progress.bestScore, result.score);
  progress.totalXp += result.xp;
  progress.hintsUsed += result.hintsUsed;
  progress.history.push({ score: result.score, xp: result.xp, date: result.date });
  if (progress.history.length > MAX_HISTORY) progress.history.shift();
  saveProgress(progress, storage);
  return progress;
}
