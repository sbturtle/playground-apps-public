import questions from '../data/questions.json' with { type: 'json' };
import { createGame } from './game.js';
import { DEFAULT_PLAYER, loadLastPlayer, loadProgress, saveLastPlayer } from './storage.js';
import { createUi } from './ui.js';

const ui = createUi(document);
const game = createGame({ questions, ui });

let player = loadLastPlayer();
ui.setPlayer(player);
ui.renderBest(loadProgress(player).bestScore);

// 닉네임이 바뀌면 그 닉네임의 최고 기록을 다시 보여 쥡니다.
ui.onPlayerChange((name) => {
  player = name.trim() || DEFAULT_PLAYER;
  saveLastPlayer(player);
  ui.renderBest(loadProgress(player).bestScore);
});
ui.onStart(() => game.start());
ui.onChoice((index) => game.submitAnswer(index));
ui.onNext(() => game.nextQuestion());
ui.onRetry(() => game.start());
