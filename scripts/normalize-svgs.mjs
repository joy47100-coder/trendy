// 그려둔 SVG들이 미리캔버스 디자인허브 규격을 만족하도록 정리한다.
// - 루트에 width/height(px)를 명시한다 (규격: 최대 6000px)
// - 배경을 채우는 도형이 섞여 있으면 경고로 알린다 (배경은 완전 투명이어야 함)
//
// 사용법: node scripts/normalize-svgs.mjs

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "public/illustrations";
const PIXEL_SIZE = 1024;
const VIEWBOX_SIZE = 512;
const MAX_PIXELS = 6000;

if (PIXEL_SIZE > MAX_PIXELS) {
  throw new Error(`PIXEL_SIZE(${PIXEL_SIZE})가 규격 상한 ${MAX_PIXELS}px을 넘습니다.`);
}

const problems = [];
let changed = 0;
let checked = 0;

for (const slug of await readdir(ROOT)) {
  const dir = join(ROOT, slug);
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".svg"))) {
    const path = join(dir, file);
    const original = await readFile(path, "utf8");
    checked++;

    const openTag = original.match(/<svg\b[^>]*>/);
    if (!openTag) {
      problems.push(`${path}: <svg> 루트 태그를 찾지 못했습니다.`);
      continue;
    }

    if (!/viewBox="0 0 512 512"/.test(openTag[0])) {
      problems.push(`${path}: viewBox가 "0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}"가 아닙니다.`);
    }

    // 캔버스를 통째로 덮는 rect는 투명 배경 규칙 위반이다.
    if (/<rect\b[^>]*\bwidth="51[02]"[^>]*\bheight="51[02]"/.test(original)) {
      problems.push(`${path}: 배경을 덮는 rect가 있는 것으로 보입니다.`);
    }

    const normalizedTag = `<svg width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" xmlns="http://www.w3.org/2000/svg">`;
    if (openTag[0] !== normalizedTag) {
      await writeFile(path, original.replace(openTag[0], normalizedTag), "utf8");
      changed++;
    }
  }
}

console.log(`검사 ${checked}개, 수정 ${changed}개`);
if (problems.length > 0) {
  console.log("\n확인이 필요한 항목:");
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exitCode = 1;
}
