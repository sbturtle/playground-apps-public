import { finalXp, scoreAnswer } from './scoring.js';
import { recordGame } from './storage.js';
import { createTimer } from './timer.js';

const QUESTION_SECONDS = 15;
const START_LIVES = 3;

/**
 * 게임 진행 상태: idle → question ⇄ feedback → result
 * - question: 답을 고르는 중 (타이머 동작)
 * - feedback: 정답/오답 확인 중 (타이머 정지)
 */
export function createGame({ questions, ui, now = () => new Date() }) {
  const state = { phase: 'idle', index: 0, score: 0, combo: 0, maxCombo: 0, lives: START_LIVES, correct: 0, timeLeft: 0 };
  let timer = null;

  function start() {
    Object.assign(state, { phase: 'question', index: 0, score: 0, combo: 0, maxCombo: 0, lives: START_LIVES, correct: 0 });
    ui.showScreen('question');
    showQuestion();
  }

  function showQuestion() {
    const question = questions[state.index];
    state.timeLeft = QUESTION_SECONDS;
    ui.renderQuestion(question, state);
    timer = createTimer(
      QUESTION_SECONDS,
      (left) => {
        state.timeLeft = left;
        ui.renderTimer(left);
      },
      () => submitAnswer(null),
    );
    timer.start();
  }

  function submitAnswer(choiceIndex) {
    if (state.phase !== 'question') return;
    timer?.stop();

    const question = questions[state.index];
    const isCorrect = choiceIndex === question.answer;
    if (isCorrect) {
      state.combo += 1;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      state.correct += 1;
      state.score += scoreAnswer({ combo: state.combo, timeLeft: state.timeLeft });
    } else {
      state.combo = 0;
      state.lives -= 1;
    }

    state.phase = 'feedback';
    ui.renderFeedback(question, choiceIndex, isCorrect, state);
    if (state.lives <= 0) endGame();
  }

  function nextQuestion() {
    if (state.phase !== 'feedback') return;
    state.index += 1;
    if (state.index >= questions.length) return endGame();
    state.phase = 'question';
    showQuestion();
  }

  function endGame() {
    timer?.stop();
    state.phase = 'result';
    const result = {
      score: state.score,
      correct: state.correct,
      total: questions.length,
      maxCombo: state.maxCombo,
      xp: finalXp(state),
      date: now().toISOString(),
    };
    const progress = recordGame(result);
    ui.showScreen('result');
    ui.renderResult(result, progress);
    return result;
  }

  return {
    start,
    submitAnswer,
    nextQuestion,
    get state() {
      return state;
    },
  };
}
