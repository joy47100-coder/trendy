import { describe, expect, it } from "vitest";

import { addLabelBox, extractSvgMarkup, hasLabelBox, parseViewBox } from "@/lib/illustration/svg";

const SAMPLE_SVG =
  '<svg viewBox="0 0 512 512"><circle cx="256" cy="256" r="100" fill="#F0A93C"/></svg>';

describe("extractSvgMarkup", () => {
  it("설명 텍스트나 코드펜스에 섞인 svg 마크업만 뽑아낸다", () => {
    const text = `여기 그림입니다:\n\`\`\`svg\n${SAMPLE_SVG}\n\`\`\``;
    expect(extractSvgMarkup(text)).toBe(SAMPLE_SVG);
  });

  it("svg 태그가 없으면 null을 반환한다", () => {
    expect(extractSvgMarkup("그림을 그릴 수 없습니다.")).toBeNull();
  });
});

describe("parseViewBox", () => {
  it("viewBox 속성을 숫자로 파싱한다", () => {
    expect(parseViewBox(SAMPLE_SVG)).toEqual({ minX: 0, minY: 0, width: 512, height: 512 });
  });
});

describe("addLabelBox", () => {
  it("빈 라벨 칸 사각형을 svg 끝에 추가한다", () => {
    const result = addLabelBox(SAMPLE_SVG);
    expect(hasLabelBox(result)).toBe(true);
    expect(result).toContain("</svg>");
  });

  it("이미 라벨 칸이 있으면 중복으로 추가하지 않는다", () => {
    const once = addLabelBox(SAMPLE_SVG);
    const twice = addLabelBox(once);
    expect(twice).toBe(once);
  });
});
