export function createHooks(callback) {
  let currentStateKey = 0; // useState가 실행 된 횟수
  let states = []; // state를 보관할 배열
  let memoState = []; // usememo 보관할 배열

  const useState = (initState) => {
    const key = currentStateKey;
    // initState로 초기값 설정
    if (states.length === key) {
      states.push(initState);
    }

    // state 할당
    const state = states[key];
    const setState = (newState) => {
      if (newState === states[key]) return;
      // state를 직접 수정하는 것이 아닌, states 내부의 값을 수정
      states[key] = newState;
      callback();
    };
    currentStateKey += 1;
    return [state, setState];
  };

  const useMemo = (fn, refs) => {
    const key = currentStateKey;

    // 이전에 계산된 값이 있고, 의존성이 변경되지 않았다면 이전 값을 반환합니다.
    if (memoState[key] && JSON.stringify(refs) === memoState[key].refs) {
      return memoState[key].value;
    }

    // 이전 값이 없거나 의존성이 변경되었다면 새로운 값을 계산하고 저장합니다.
    const value = fn();
    memoState[key] = { value, refs: JSON.stringify(refs) };

    return value;
  };

  const resetContext = () => {
    currentStateKey = 0;
  };

  return { useState, useMemo, resetContext };
}
