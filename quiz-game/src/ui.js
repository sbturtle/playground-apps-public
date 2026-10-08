export function createUi(doc) {
  const $ = (id) => doc.getElementById(id);
  const screens = { start: $('screen-start'), question: $('screen-question'), result: $('screen-result') };
  let choiceHandler = () => {};

  const ui = {
    showScreen(name) {
      for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
    },

    renderBest(best) {
      $('best').textContent = best > 0 ? `최고 기록 ${best}점` : '';
    },

    renderQuestion(question, state) {
      $('question-text').textContent = `${state.index + 1}. ${question.text}`;
      $('feedback').textContent = '';
      $('btn-next').hidden = true;
      $('btn-hint').disabled = Boolean(state.hintUsed);
      $('choices').replaceChildren(
        ...question.choices.map((choice, i) => {
          const li = doc.createElement('li');
          const button = doc.createElement('button');
          button.textContent = choice;
          button.addEventListener('click', () => choiceHandler(i));
          li.append(button);
          return li;
        }),
      );
      ui.renderHud(state);
    },

    renderHud(state) {
      $('score').textContent = `${state.score}점`;
      $('combo').textContent = state.combo >= 2 ? `${state.combo}콤보` : '';
      $('lives').textContent = '♥'.repeat(Math.max(0, state.lives));
    },

    renderTimer(left) {
      $('timer').textContent = `${left}초`;
    },

    renderFeedback(question, choiceIndex, isCorrect, state) {
      const answerText = question.choices[question.answer];
      $('feedback').textContent = isCorrect
        ? `정답! ${question.explanation}`
        : `${choiceIndex === null ? '시간 초과' : '오답'} · 정답: ${answerText}. ${question.explanation}`;
      for (const button of $('choices').querySelectorAll('button')) button.disabled = true;
      $('btn-next').hidden = state.lives <= 0;
      ui.renderHud(state);
    },

    renderResult(result, progress) {
      $('result-text').textContent =
        `${result.total}문제 중 ${result.correct}개 정답 · ${result.score}점 · 최고 콤보 ${result.maxCombo} · 최고 기록 ${progress.bestScore}점`;
    },

    onStart(handler) {
      $('btn-start').addEventListener('click', handler);
    },
    onChoice(handler) {
      choiceHandler = handler;
    },
    onNext(handler) {
      $('btn-next').addEventListener('click', handler);
    },
    onHint(handler) {
      $('btn-hint').addEventListener('click', handler);
    },
    onRetry(handler) {
      $('btn-retry').addEventListener('click', handler);
    },
  };
  return ui;
}
