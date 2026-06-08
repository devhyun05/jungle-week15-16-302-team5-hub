# 프론트엔드 troubleshooting

### 문제

카테고리 버튼을 눌렀을 때, 한 카테고리만 색상이 바뀌는게 아니라 전체가 바뀌는 문제

#### 증상

![alt text](image.png)
카테고리 버튼 중 `전자기기`를 클릭했는데, `전자기기`만 활성화되는 것이 아니라 모든 카테고리 버튼이 활성화 색상으로 바뀌었다.

#### 원인

![alt text](image-1.png)
여러 버튼들이 동일한 isActive state를 공유하고 있어서 발생하는 문제

#### 해결 방법

![alt text](image-2.png)
기존에 하드 코딩되어 있던 카테고리들을 리스트를 map으로 순회하는 방식으로 변경하고, setSelectedCategory를 이용해서
현재 선택된 카테고리를 state의 string으로 변경하고 삼항 연산자를 통해서 css를 변경한다

#### 참고 문서

https://react.dev/learn/choosing-the-state-structure
