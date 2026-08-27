export interface ParsedViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * 모델 응답 텍스트에서 <svg>...</svg> 마크업만 뽑아낸다.
 * 마크다운 코드펜스나 설명 문장이 섞여 있어도 걷어낸다.
 */
export function extractSvgMarkup(text: string): string | null {
  const start = text.indexOf("<svg");
  const end = text.lastIndexOf("</svg>");
  if (start === -1 || end === -1 || end < start) return null;
  return text.slice(start, end + "</svg>".length).trim();
}

export function parseViewBox(svg: string): ParsedViewBox | null {
  const match = svg.match(/viewBox="([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)"/);
  if (!match) return null;
  const [, minX, minY, width, height] = match;
  return {
    minX: Number(minX),
    minY: Number(minY),
    width: Number(width),
    height: Number(height),
  };
}

const HEX_COLOR_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

/** fill="#xxxxxx" 형태의 색상을 모두 모아 중복을 제거한다 (대략적인 검사용). */
export function extractFillHexColors(svg: string): string[] {
  const colors = new Set<string>();
  for (const match of svg.matchAll(HEX_COLOR_RE)) {
    colors.add(normalizeHex(match[1]));
  }
  return Array.from(colors);
}

function normalizeHex(hex: string): string {
  const value = hex.length === 3
    ? hex.split("").map((c) => c + c).join("")
    : hex;
  return `#${value.toLowerCase()}`;
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function averageLuminance(svg: string): number {
  const colors = extractFillHexColors(svg);
  if (colors.length === 0) return 0.5;
  const total = colors.reduce((sum, c) => sum + relativeLuminance(c), 0);
  return total / colors.length;
}

const LABEL_BOX_MARKER = "data-label-box";

export function hasLabelBox(svg: string): boolean {
  return svg.includes(LABEL_BOX_MARKER);
}

/**
 * 그림 아래쪽에 빈 라벨 칸을 하나 얹는다. 텍스트는 채우지 않는다.
 * 그림 전체의 평균 색 밝기에 따라 박스 색을 밝게/어둡게 골라 어울리도록 한다.
 */
export function addLabelBox(svg: string): string {
  if (hasLabelBox(svg)) return svg;
  const box = parseViewBox(svg);
  const width = box?.width ?? 512;
  const height = box?.height ?? 512;
  const minX = box?.minX ?? 0;
  const minY = box?.minY ?? 0;

  const isDarkArtwork = averageLuminance(svg) < 0.5;
  const fill = isDarkArtwork ? "#FFFFFF" : "#2B2B2B";
  const fillOpacity = 0.88;
  const stroke = isDarkArtwork ? "#2B2B2B" : "#FFFFFF";

  const boxWidth = width * 0.62;
  const boxHeight = height * 0.14;
  const boxX = minX + (width - boxWidth) / 2;
  const boxY = minY + height - boxHeight - height * 0.05;
  const rx = boxHeight * 0.22;

  const labelMarkup = `<rect ${LABEL_BOX_MARKER}="true" x="${round(boxX)}" y="${round(boxY)}" width="${round(boxWidth)}" height="${round(boxHeight)}" rx="${round(rx)}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="2"/>`;

  return svg.replace("</svg>", `${labelMarkup}</svg>`);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
