const KEY = 'quiz-game:progress';
const VERSION = 3;
const MAX_HISTORY = 50;

function emptyProgress() {
  return { version: VERSION, bestScore: 0, totalXp: 0, history: [] };
}

// v1(버전 필드 없음) 형식: { best, xp, history: [{ score, date }] }
// v2 형식: { version: 2, bestScore, totalXp, history: [{ score, xp, date }] }
// v3 형식: v2와 같고, history 항목에 문제 수(total)가 붙습니다. 이전 판은 total을 null로 둡니다.
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.version === undefined) {
    raw = {
      version: 2,
      bestScore: raw.best ?? 0,
      totalXp: raw.xp ?? 0,
      history: Array.isArray(raw.history) ? raw.history : [],
    };
  }
  if (raw.version === 2) {
    const history = Array.isArray(raw.history) ? raw.history : [];
    return { ...raw, version: VERSION, history: history.map((h) => ({ ...h, total: h.total ?? null })) };
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
  progress.history.push({ score: result.score, xp: result.xp, total: result.total, date: result.date });
  if (progress.history.length > MAX_HISTORY) progress.history.shift();
  saveProgress(progress, storage);
  return progress;
}
