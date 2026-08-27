// 화풍별로 SVG 소스를 최종 산출 포맷(SVG 또는 PNG)으로 정리한다.
// 매핑은 lib/illustration/style-guide.ts의 STYLES[].preferredFormat과 반드시 맞춰야 한다
// (이 스크립트는 순수 Node라서 .ts를 직접 import할 수 없어 아래 표를 따로 둔다).
//
// 규칙 (skill.md 기반, docs/decisions/output-file-format.md 참고):
// - preferredFormat이 "png"인 화풍은 항상 PNG로 래스터화한다.
// - preferredFormat이 "svg"인 화풍은 실제 파일이 150KB 이하면 SVG를 그대로 쓰고,
//   넘으면 그 파일만 PNG로 폴백한다.
// - 최종 결과를 lib/illustration/candidate-formats.json에 기록해 앱이 참조하게 한다.
//
// 사용법: node scripts/build-illustration-formats.mjs

import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = "public/illustrations";
const MANIFEST_PATH = "lib/illustration/candidate-formats.json";

// lib/illustration/style-guide.ts의 STYLES[].preferredFormat과 동기화할 것.
const PREFERRED_FORMAT_BY_STYLE_ID = {
  1: "svg", // 손그림 플랫
  2: "svg", // 미니멀 라인아트
  3: "svg", // 기하학 페이퍼컷 (그림자·질감 없음)
  4: "png", // 수채화 번짐
  5: "png", // 레트로 스티커
  6: "svg", // 픽셀아트
  7: "svg", // 네온 글로우 라인
  8: "png", // 콜라주 스크랩북
};

const SVG_MAX_BYTES = 150 * 1024;
// 미리캔버스 PNG(일러스트) 규격: 1500~9800px, 120dpi 이상.
const PNG_SIZE = 2000;
const DPI = 144;

async function rasterize(svgBytes, pngPath) {
  await sharp(svgBytes, { density: DPI })
    .resize(PNG_SIZE, PNG_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .withMetadata({ density: DPI })
    .toFile(pngPath);
}

const manifest = {};
const counts = { svg: 0, png: 0, fallback: 0 };

for (const slug of await readdir(ROOT)) {
  const dir = join(ROOT, slug);
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".svg"))) {
    const styleId = Number(file.replace(/\.svg$/, ""));
    const preferred = PREFERRED_FORMAT_BY_STYLE_ID[styleId];
    if (!preferred) {
      throw new Error(`${dir}/${file}: 화풍 id ${styleId}에 대한 preferredFormat이 없습니다.`);
    }

    const svgPath = join(dir, file);
    const pngPath = svgPath.replace(/\.svg$/, ".png");
    const svgBytes = await readFile(svgPath);
    const candidateKey = `${slug}-${styleId}`;

    if (preferred === "png") {
      await rasterize(svgBytes, pngPath);
      manifest[candidateKey] = "png";
      counts.png++;
      continue;
    }

    // preferred === "svg"
    if (svgBytes.byteLength <= SVG_MAX_BYTES) {
      // 이전 실행에서 남은 PNG가 있으면 정리해 SVG/PNG 어느 쪽이 최종인지 헷갈리지 않게 한다.
      await rm(pngPath, { force: true });
      manifest[candidateKey] = "svg";
      counts.svg++;
    } else {
      console.warn(
        `  ${svgPath}: ${Math.round(svgBytes.byteLength / 1024)}KB로 150KB 초과 — PNG로 폴백합니다.`
      );
      await rasterize(svgBytes, pngPath);
      manifest[candidateKey] = "png";
      counts.fallback++;
    }
  }
}

await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(
  `svg ${counts.svg}개, png ${counts.png}개, 150KB 초과로 png 폴백 ${counts.fallback}개 → ${MANIFEST_PATH} 갱신`
);
