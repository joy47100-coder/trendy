# 라벨 칸 기본 크기가 매직 넘버로 중복됨

`lib/illustration/svg.ts`의 `addLabelBox`가 viewBox 파싱 실패 시 fallback으로 `512`를
하드코딩하고 있는데, 같은 값이 `lib/illustration/style-guide.ts`의
`ILLUSTRATION_VIEWBOX_SIZE`로 이미 정의되어 있다. 나중에 viewBox 크기를 바꾸면 두 곳을
따로 고쳐야 한다. `code-review low`에서 나온 지적이며, 스펙 수용 기준을 깨지 않아 이번
범위에서는 고치지 않았다.
