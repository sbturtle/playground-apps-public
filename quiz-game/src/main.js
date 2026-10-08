import questions from '../data/questions.json' with { type: 'json' };
import { createGame } from './game.js';
import { loadProgress } from './storage.js';
import { createUi } from './ui.js';

const ui = createUi(document);
const game = createGame({ questions, ui });

ui.renderBest(loadProgress().bestScore);
ui.onStart(() => game.start());
ui.onChoice((index) => game.submitAnswer(index));
ui.onNext(() => game.nextQuestion());
ui.onRetry(() => game.start());
