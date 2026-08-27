import { STYLES } from "./style-guide";
import candidateFormats from "./candidate-formats.json";

export interface CatalogKeyword {
  /** URL·파일 경로에 쓰는 영문 슬러그. */
  slug: string;
  /** 화면에 보여주는 한국어 라벨. */
  label: string;
  /** 화면을 조금 더 귀엽게 보여주기 위한 장식용 이모지. 데이터 자체와는 무관하다. */
  emoji: string;
  /**
   * 이 키워드에서 보여줄 화풍 id 5개 (style-guide.ts의 STYLES 기준). 방문할 때마다 바뀌면
   * 방문자마다 다른 후보를 보고 투표하게 되어 "몇 %가 이 그림을 골랐는지" 비교가 무의미해진다.
   * 그래서 무작위로 뽑지 않고 키워드마다 고정으로 못 박아둔다. 화면에는 이 5개를 보여주는
   * "순서"만 방문마다 섞는다 (app/page.tsx 참고).
   */
  styleIds: readonly number[];
}

/**
 * 투표에 쓰는 키워드 목록.
 * 각 키워드의 후보는 public/illustrations/<slug>/<style id>.svg 로 화풍 풀(style-guide.ts의
 * STYLES) 중 styleIds에 지정된 5개만 그려두고, scripts/build-illustration-formats.mjs로
 * 화풍별 최적 포맷(SVG 또는 PNG)으로 정리한다. 실제 확장자는 candidate-formats.json을 따른다.
 */
export const CATALOG: readonly CatalogKeyword[] = [
  { slug: "beer", label: "맥주", emoji: "🍺", styleIds: [1, 2, 3, 4, 5] },
  { slug: "airpods-case", label: "에어팟 케이스", emoji: "🎧", styleIds: [2, 3, 4, 5, 6] },
  { slug: "tattoo", label: "타투 도안", emoji: "🖋️", styleIds: [3, 4, 5, 6, 7] },
  { slug: "kids-backpack", label: "유치원아이 가방", emoji: "🎒", styleIds: [4, 5, 6, 7, 8] },
  { slug: "phone-wallpaper", label: "갖고 있으면 부자될 것 같은 그림", emoji: "📱", styleIds: [1, 5, 6, 7, 8] },
];

/** 후보 하나를 가리키는 안정적인 식별자. 투표 집계 키로 쓴다. */
export function candidateId(slug: string, index: number): string {
  return `${slug}-${index}`;
}

const CANDIDATE_FORMATS: Record<string, string> = candidateFormats;

export function candidateSrc(slug: string, index: number): string {
  const key = candidateId(slug, index);
  const format = CANDIDATE_FORMATS[key] ?? "png";
  return `/illustrations/${slug}/${index}.${format}`;
}

export function candidateIndexes(): number[] {
  return STYLES.map((style) => style.id);
}
