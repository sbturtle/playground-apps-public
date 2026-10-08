const KEY = 'quiz-game:progress';
const VERSION = 3;
const MAX_HISTORY = 50;
export const MODES = ['normal', 'hard'];

function emptyProgress() {
  return { version: VERSION, bestScore: 0, totalXp: 0, historyByMode: { normal: [], hard: [] } };
}

// v1(버전 필드 없음) 형식: { best, xp, history: [{ score, date }] }
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.version === undefined) {
    return {
      ...emptyProgress(),
      bestScore: raw.best ?? 0,
      totalXp: raw.xp ?? 0,
      historyByMode: { normal: Array.isArray(raw.history) ? raw.history : [], hard: [] },
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

/** 게임 결과를 해당 난이도의 기록에 반영하고 저장합니다. */
export function recordGame(result, storage = localStorage) {
  const progress = loadProgress(storage);
  const mode = MODES.includes(result.mode) ? result.mode : 'normal';
  const history = progress.historyByMode[mode];
  progress.bestScore = Math.max(progress.bestScore, result.score);
  progress.totalXp += result.xp;
  history.push({ score: result.score, xp: result.xp, date: result.date });
  if (history.length > MAX_HISTORY) history.shift();
  saveProgress(progress, storage);
  return progress;
}
