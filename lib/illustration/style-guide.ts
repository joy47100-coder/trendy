/** 그림을 그리는 좌표 공간. */
export const ILLUSTRATION_VIEWBOX_SIZE = 512;

/**
 * SVG 루트에 선언하는 실제 픽셀 크기.
 * 미리캔버스 디자인허브 SVG 요소 규격은 최대 6000px·72dpi 이상이라,
 * 크기를 선언하지 않으면 심사 도구가 어떻게 읽을지 보장할 수 없다.
 */
export const ILLUSTRATION_PIXEL_SIZE = 1024;

export type IllustrationFormat = "svg" | "png";

export interface IllustrationStyle {
  /** 파일 이름에 쓰는 번호. public/illustrations/<slug>/<id>.svg */
  id: number;
  name: string;
  /** 그림을 그릴 때 따라야 하는 화풍 지침 (Claude Code 세션에서 그릴 때 참고용). */
  guide: string;
  /**
   * 이 화풍의 기본 산출 포맷. SVG로 지정된 화풍도 실제 파일이 150KB를 넘으면
   * scripts/build-illustration-formats.mjs가 개별 파일 단위로 PNG로 폴백한다.
   * [output-file-format 결정](../../docs/decisions/output-file-format.md) 참고.
   */
  preferredFormat: IllustrationFormat;
}

/**
 * 미감 테스트에서 비교하는 화풍 풀. 같은 키워드를 이 화풍들로 각각 그려두고,
 * 방문자에게는 매번 이 중 CANDIDATES_PER_KEYWORD개를 무작위로 뽑아 보여준다
 * (매번 같은 5개만 나오면 지루하다는 피드백으로 풀을 5개에서 8개로 늘렸다).
 */
export const STYLES: readonly IllustrationStyle[] = [
  {
    id: 1,
    name: "손그림 플랫",
    guide: [
      "손으로 그린 듯 살짝 불완전하고 흔들리는 윤곽선 (path의 곡선 제어점을 미세하게 비대칭으로).",
      "두껍고 둥근 어두운 윤곽선(stroke-width 5~8, stroke-linecap/linejoin=round)으로 형태를 감싼다.",
      "안쪽은 따뜻한 색의 평평한 단색으로 채운다.",
      "전체적으로 친근하고 포근한 인상.",
    ].join("\n"),
    preferredFormat: "svg",
  },
  {
    id: 2,
    name: "미니멀 라인아트",
    guide: [
      "선으로만 그린다. 면 채우기는 하지 않거나(fill=none), 포인트 한 곳에만 아주 절제되게 쓴다.",
      "굵기가 일정한 가는 선(stroke-width 3~4, stroke-linecap/linejoin=round)만 사용한다.",
      "형태를 최소한의 선으로 압축한다. 디테일을 과감히 생략한다.",
      "색은 선 색 1개 + 포인트 색 1개까지. 전체적으로 담백하고 세련된 인상.",
    ].join("\n"),
    preferredFormat: "svg",
  },
  {
    id: 3,
    name: "기하학 페이퍼컷",
    guide: [
      "윤곽선(stroke)을 전혀 쓰지 않는다. 색 면(fill)만으로 형태를 만든다.",
      "종이를 오려 붙인 듯 단순한 기하학적 도형(원, 삼각형, 사다리꼴, 둥근 사각형)을 겹쳐서 대상을 표현한다.",
      "면과 면이 만나는 곳은 살짝 겹치게 그려 흰 틈이 보이지 않게 한다.",
      "채도가 또렷한 색 3~5개를 대비 있게 쓴다. 전체적으로 모던하고 그래픽적인 인상.",
    ].join("\n"),
    // 그림자·질감이 없는 플랫 도형이라 SVG로 나간다. 나중에 그림자·질감을 추가하면 PNG로 바꿔야 한다.
    preferredFormat: "svg",
  },
  {
    id: 4,
    name: "수채화 번짐",
    guide: [
      "윤곽선을 쓰지 않는다. 부드러운 유기적 곡선(path)만으로 형태를 만든다.",
      "반투명한 색 레이어(fill-opacity 0.55~0.85)를 2~3겹 살짝 어긋나게 겹쳐 번짐 효과를 낸다.",
      "가장자리가 살짝 삐져나가듯 부정확하게, 물감이 퍼진 느낌으로 그린다.",
      "채도 낮은 차분한 색(더스티 로즈, 세이지, 오커, 슬레이트 블루). 전체적으로 은은하고 손그림 물감 같은 인상.",
    ].join("\n"),
    preferredFormat: "png",
  },
  {
    id: 5,
    name: "레트로 스티커",
    guide: [
      "실루엣을 따라 두꺼운 흰색 다이컷 테두리를 먼저 깔고, 그 위에 그림을 그려 스티커처럼 오려낸 느낌을 낸다.",
      "그 위 그림은 두꺼운 어두운 윤곽선(stroke-width 6~7)과 대담한 평면 채색으로 그린다.",
      "70년대풍 배색(머스터드, 브릭레드, 틸, 크림, 다크브라운)을 통일해서 쓴다.",
      "굵은 줄무늬 밴드나 짧은 반짝임 선 같은 레트로 장식을 한두 개 곁들인다. 전체적으로 강렬하고 뱃지 같은 인상.",
    ].join("\n"),
    preferredFormat: "png",
  },
  {
    id: 6,
    name: "픽셀아트",
    guide: [
      "8x8~16x16 격자에 맞춘 사각형 블록만으로 형태를 만든다. 곡선이나 사선을 쓰지 않는다.",
      "안티앨리어싱 없이 픽셀 경계가 딱딱 끊어지게, 계단 형태(지그재그)로 곡선을 흉내낸다.",
      "레트로 8비트 게임 느낌의 채도 높은 색 4~5개를 쓴다.",
      "윤곽선은 쓰지 않는다(블록 색 자체가 경계). 전체적으로 레트로 게임 같은 인상.",
    ].join("\n"),
    preferredFormat: "svg",
  },
  {
    id: 7,
    name: "네온 글로우 라인",
    guide: [
      "형태를 얇고 밝은 네온색 선(stroke)으로만 그린다. 채우기는 쓰지 않는다.",
      "빛나는 느낌을 내려고, 같은 경로를 굵고 연한(fill-opacity 낮은) 같은 색 선으로 한 번 더 그린 뒤 그 위에 얇고 진한 선을 겹친다 (filter나 blur 없이 겹쳐 그리는 방식으로 광선 효과를 흉내낸다).",
      "채도 높은 형광색(마젠타, 시안, 라임그린, 핫핑크) 위주로 쓴다.",
      "전체적으로 어두운 곳에서 빛나는 사이버틱하고 강렬한 인상.",
    ].join("\n"),
    preferredFormat: "svg",
  },
  {
    id: 8,
    name: "콜라주 스크랩북",
    guide: [
      "실루엣 가장자리를 매끈하지 않고 삐뚤빼뚤 찢어진 종이처럼(지그재그 톱니 모양) 그린다.",
      "그 뒤에 살짝 회전된 사각형(마스킹테이프나 메모지처럼)을 반투명하게 깔아 겹쳐진 종이 느낌을 낸다.",
      "가장자리를 따라 점선(바느질 자국처럼)을 얇은 선으로 추가한다.",
      "크라프트지·크림색 바탕 톤에 포인트 색 1~2개만 쓴다. 전체적으로 손으로 오려 붙인 스크랩북 같은 인상.",
    ].join("\n"),
    preferredFormat: "png",
  },
];

export function styleById(id: number): IllustrationStyle | undefined {
  return STYLES.find((style) => style.id === id);
}

/** 모든 화풍에 공통으로 적용되는 미리캔버스 디자인허브 형식 규칙. */
export const SHARED_FORMAT_RULES = [
  "배경은 완전히 투명해야 한다. 배경을 채우는 사각형이나 도형을 절대 그리지 않는다.",
  "피사체 하나만 그린다. 여러 개의 서로 다른 대상을 한 그림에 넣지 않는다.",
  "피사체 기준 상하좌우 여백 없이 꽉 차게 그린다.",
  "색상은 최대 5개까지만 쓴다. 비슷한 색조는 하나로 통합한다.",
  "인접한 색 도형 사이에 렌더링 시 흰 틈(크랙)이 보이지 않도록 경계를 맞닿거나 살짝 겹치게 그린다.",
  `루트 태그는 정확히: <svg width="${ILLUSTRATION_PIXEL_SIZE}" height="${ILLUSTRATION_PIXEL_SIZE}" viewBox="0 0 ${ILLUSTRATION_VIEWBOX_SIZE} ${ILLUSTRATION_VIEWBOX_SIZE}" xmlns="http://www.w3.org/2000/svg">`,
].join("\n");
