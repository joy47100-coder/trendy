/** 키워드 개수 상한 (비용 안전장치, 구현 중 조정 가능한 값). */
export const MAX_KEYWORDS = 10;

/**
 * 키워드마다 화면에 동시에 보여줄 후보 개수. 화풍 풀(style-guide.ts의 STYLES) 전체가 아니라
 * 그중 이 개수만큼을 매번 무작위로 뽑아 보여준다. 한눈에 비교하기 좋은 개수로 5를 쓴다.
 */
export const CANDIDATES_PER_KEYWORD = 5;
