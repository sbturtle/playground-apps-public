import questions from '../data/questions.json' with { type: 'json' };
import { createGame } from './game.js';
import { loadProgress } from './storage.js';
import { createUi } from './ui.js';

// ?count=N이면 앞에서부터 N문제만 냅니다. 0이거나 없으면(숫자가 아니어도) 전체 문제를 냅니다.
const count = Number(new URLSearchParams(location.search).get('count') ?? 0);
const selected = Number.isInteger(count) && count > 0 ? questions.slice(0, count) : questions;

const ui = createUi(document);
const game = createGame({ questions: selected, ui });

ui.renderBest(loadProgress().bestScore);
ui.onStart(() => game.start());
ui.onChoice((index) => game.submitAnswer(index));
ui.onNext(() => game.nextQuestion());
ui.onRetry(() => game.start());
