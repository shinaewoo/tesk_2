//가상 DOM 요소를 생성하는 역할
export function jsx(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() };
}

export function createElement(node) {
  // jsx를 dom으로 변환
  if (typeof node === "string") {
    return document.createTextNode(node);
  }

  const element = document.createElement(node.type);

  updateAttributes(element, node.props, {});

  node.children.forEach((child) => {
    element.appendChild(createElement(child));
  });

  return element;
}

function updateAttributes(target, newProps, oldProps) {
  if (!newProps || !oldProps) return;
  // newProps들을 반복하여 각 속성과 값을 확인
  for (const [key, value] of Object.entries(newProps)) {
    // 만약 oldProps에 같은 속성이 있고 값이 동일하다면
    if (oldProps[key] === value) {
      continue; // 다음 속성으로 넘어감 (변경 불필요)
    }

    // 만약 위 조건에 해당하지 않는다면 (속성값이 다르거나 구속성에 없음)
    //target에 해당 속성을 새 값으로 설정
    target.setAttribute(key, value);
  }

  // oldProps을 반복하여 각 속성 확인
  for (const key in oldProps) {
    // 만약 newProps들에 해당 속성이 존재한다면 다음 속성으로 넘어감 (속성 유지 필요)
    if (key in newProps) {
      continue;
    }

    // newProps들에 해당 속성이 존재하지 않는다면 target에서 해당 속성을 제거
    target.removeAttribute(key);
  }
}

export function render(parent, newNode, oldNode, index = 0) {
  // 1. 만약 newNode가 없고 oldNode만 있다면
  //   parent에서 oldNode를 제거
  if (!newNode && oldNode) {
    return parent.removeChild(parent.childNodes[index]);
  }

  //   종료
  // 2. 만약 newNode가 있고 oldNode가 없다면
  //   newNode를 생성하여 parent에 추가
  if (newNode && !oldNode) {
    return parent.appendChild(createElement(newNode));
  }

  //   종료
  // 3. 만약 newNode와 oldNode 둘 다 문자열이고 서로 다르다면
  //   oldNode를 newNode로 교체
  if (
    typeof newNode === "string" &&
    typeof oldNode === "string" &&
    newNode !== oldNode
  ) {
    return parent.replaceChild(
      document.createTextNode(newNode),
      parent.childNodes[index]
    );
  }
  //   종료
  // 4. 만약 newNode와 oldNode의 타입이 다르다면
  //   oldNode를 newNode로 교체
  if (newNode.type !== oldNode.type) {
    return parent.replaceChild(
      createElement(newNode),
      parent.childNodes[index]
    );
  }
  //   종료
  if (newNode.type && oldNode.type && newNode.type === oldNode.type) {
    // 5. newNode와 oldNode에 대해 updateAttributes 실행
    updateAttributes(parent.childNodes[index], newNode.props, oldNode.props);

    // 6. newNode와 oldNode 자식노드들 중 더 긴 길이를 가진 것을 기준으로 반복
    //   각 자식노드에 대해 재귀적으로 render 함수 호출
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    const maxLength = Math.max(newLength, oldLength);

    for (let i = 0; i < maxLength; i++) {
      render(
        parent.childNodes[index],
        newNode.children[i],
        oldNode.children[i],
        i
      );
    }
  }
}
