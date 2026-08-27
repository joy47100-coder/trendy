import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "당신의 미감 테스트",
  description: "같은 대상을 다섯 가지 화풍으로 그렸어요. 당신의 선택은 얼마나 남들과 같을까요?",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", publicSans.variable)}
    >
      <head>
        {/* next/font/google가 이 프로젝트에선 한글 서브셋을 지원하지 않아, 한글 커스텀 폰트는
            CDN 스타일시트로 불러온다. Pretendard: 요즘 한국 서비스 UI에서 표준처럼 쓰이는
            깔끔한 가변 폰트 (손글씨 느낌의 Gaegu는 촌스러워 보인다는 피드백으로 교체). */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      {/* 이 앱은 거의 다 한글 텍스트라, 헤딩에만 커스텀 폰트를 쓰면 본문(시스템 기본 서체)과
          따로 노는 느낌이 난다. body 전체에 font-heading(Pretendard 우선)을 적용해 톤을 통일한다. */}
      <body className="font-heading flex min-h-full flex-col">{children}</body>
    </html>
  );
}
