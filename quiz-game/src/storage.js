const KEY_PREFIX = 'quiz-game:progress:';
const LAST_PLAYER_KEY = 'quiz-game:last-player';
const VERSION = 2;
const MAX_HISTORY = 50;

export const DEFAULT_PLAYER = '플레이어';

function emptyProgress() {
  return { version: VERSION, bestScore: 0, totalXp: 0, history: [] };
}

// v1(버전 필드 없음) 형식: { best, xp, history: [{ score, date }] }
function migrate(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.version === undefined) {
    return {
      version: VERSION,
      bestScore: raw.best ?? 0,
      totalXp: raw.xp ?? 0,
      history: Array.isArray(raw.history) ? raw.history : [],
    };
  }
  if (raw.version === VERSION) return raw;
  return emptyProgress();
}

/** 플레이어(닉네임)별 기록을 읽습니다. */
export function loadProgress(player, storage = localStorage) {
  try {
    return migrate(JSON.parse(storage.getItem(KEY_PREFIX + player) ?? 'null'));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, player, storage = localStorage) {
  storage.setItem(KEY_PREFIX + player, JSON.stringify(progress));
}

/** 게임 결과를 플레이어의 누적 기록에 반영하고 저장합니다. */
export function recordGame(result, player, storage = localStorage) {
  const progress = loadProgress(player, storage);
  progress.bestScore = Math.max(progress.bestScore, result.score);
  progress.totalXp += result.xp;
  progress.history.push({ score: result.score, xp: result.xp, date: result.date });
  if (progress.history.length > MAX_HISTORY) progress.history.shift();
  saveProgress(progress, player, storage);
  return progress;
}

// 마지막으로 쓴 닉네임을 기억함니다.
export function loadLastPlayer(storage = localStorage) {
  return storage.getItem(LAST_PLAYER_KEY) ?? DEFAULT_PLAYER;
}

export function saveLastPlayer(player, storage = localStorage) {
  storage.setItem(LAST_PLAYER_KEY, player);
}
