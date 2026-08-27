# 일러스트 제작 방식

## Decisions

- 일러스트는 런타임에 이미지 생성 API를 호출해서 만들지 않는다. Claude Code 세션에서 Claude가 직접 SVG 마크업을 작성해 정적 파일(`public/illustrations/<slug>/<n>.svg`)로 저장하고, 앱은 그 파일을 그대로 서빙한다.

## Boundaries

- 이 결정은 미리캔버스 디자인허브 제출용 일러스트에만 적용된다.
- 새 키워드나 새 후보가 필요하면 코드를 바꾸는 게 아니라, Claude Code 세션에서 그림을 더 그려 파일로 추가하고 `lib/illustration/catalog.ts`에 항목을 넣는다.

## Why

사용자가 별도의 이미지 생성 API 키를 두고 싶어하지 않았고, "Claude한테 그냥 그려달라고 하면 된다"는 방식을 명시적으로 선택했다. Claude는 SVG를 코드로 직접 작성할 수 있어서 (1) 런타임 API 키·비용·약관 문제가 전혀 없고, (2) 결과물이 진짜 벡터라 래스터→벡터 변환 품질 손실이 없으며, (3) 배포된 앱이 정적 파일만 서빙하면 되어 구조가 단순하다. 대신 그림 추가는 자동이 아니라 사람이 Claude Code를 열어서 하는 수동 작업이 된다.

## Reconsider when

- 키워드와 후보를 앱 안에서 자동으로 계속 늘려야 할 만큼 규모가 커질 때. 그때는 런타임 이미지 생성 API 연동을 다시 검토한다.
- 사진처럼 정교한 화풍이 필요해질 때. Claude의 SVG 코드 작성 방식으로는 한계가 있다.

## Still-rejected alternatives

- OpenAI Images API(gpt-image-1) — 별도 계정·키·비용이 필요하고 래스터 결과물이라 SVG로 쓰려면 벡터 변환이 추가로 필요함; 자동 생성 규모가 커지면 재검토.
- Claude API(Messages API) 런타임 호출 — SVG를 직접 그리는 방식 자체는 같지만, 배포 환경에서 API 키가 필요해 사용자가 원치 않았음.
- Stability AI, Midjourney — 각각 라이선스 복잡도와 공식 API 부재로 부적합.

## Evidence worth preserving

- 세션 중 Claude가 그린 맥주·고양이 SVG로 화풍과 품질을 직접 확인했다 (플랫 일러스트, 손그림 느낌 윤곽선, 투명 배경 정상).
