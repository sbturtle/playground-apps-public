/**
 * 1초마다 onTick(남은 초)을 부르고, 0이 되면 onEnd를 한 번 부릅니다.
 * stop()을 부르면 이후 onTick·onEnd는 호출되지 않습니다.
 */
export function createTimer(seconds, onTick, onEnd, { interval = 1000 } = {}) {
  let left = seconds;
  let handle = null;

  const timer = {
    start() {
      if (handle) return;
      onTick(left);
      handle = setInterval(() => {
        left -= 1;
        onTick(left);
        if (left <= 0) {
          timer.stop();
          onEnd();
        }
      }, interval);
    },
    stop() {
      clearInterval(handle);
      handle = null;
    },
  };
  return timer;
}
