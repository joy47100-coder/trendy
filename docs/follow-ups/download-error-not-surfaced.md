# zip 다운로드 실패가 화면에 표시되지 않음

## 증상

`app/page.tsx`의 `handleDownload`가 `void downloadIllustrationsZip(groups)`로 호출되어
있어, zip 생성이나 다운로드 트리거 과정에서 오류가 나도 사용자에게 아무 표시가 없다.

## 근거

`code-review low` 통과: `.catch` 없이 fire-and-forget으로 호출됨 (`app/page.tsx` 76번 줄
부근). 생성 흐름(`handleGenerate`)은 실패 시 `errorMessage`를 보여주지만, 다운로드 흐름은
그런 처리가 없다.

## 시도한 것

없음 — 스펙 수용 기준을 깨는 문제는 아니라서(다운로드 자체는 정상 동작) 이번 구현 범위에서는
고치지 않았다.

## 제안하는 다음 단계

`downloadIllustrationsZip` 호출에 `.catch`를 추가해 실패 시 `errorMessage` state를 채우는
정도의 작은 수정으로 해결 가능하다.
