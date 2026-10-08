/**
 * 정답 1개 점수: 기본 100점 + 남은 시간 1초당 5점.
 * 콤보 3부터는 콤보 1 늘 때마다 50점씩 추가합니다.
 */
export function scoreAnswer({ combo, timeLeft }) {
  const base = 100 + Math.max(0, Math.floor(timeLeft)) * 5;
  const comboBonus = combo >= 3
    ? (combo - 2) * 50
    : 0;
  return base + comboBonus;
}

/** 경험치: 정답 1개당 10, 최대 콤보가 5 이상이면 보너스 30 */
export function finalXp({ correct, maxCombo }) {
  return correct * 10 + (maxCombo >= 5 ? 30 : 0);
}
