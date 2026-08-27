"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CATALOG,
  candidateId,
  candidateIndexes,
  candidateSrc,
} from "@/lib/illustration/catalog";
import { CANDIDATES_PER_KEYWORD } from "@/lib/illustration/constants";

type Selections = Record<string, number>;
type Tally = Record<string, number>;

export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [tally, setTally] = useState<Tally | null>(null);
  const [liveTally, setLiveTally] = useState<Tally | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 화풍 풀 전체(집계용) — 방문자에게 실제로 보이지 않은 화풍의 표까지 포함해야
  // "전체 투표 중 몇 %" 같은 집계가 정확하다.
  const indexes = useMemo(() => candidateIndexes(), []);
  const current = CATALOG[step];
  // 매번 같은 화풍 5개만 나오면 지루하다는 피드백으로, 키워드마다 풀에서 무작위로
  // CANDIDATES_PER_KEYWORD개를 뽑아 보여준다. 득표 집계는 style id 기준이라 어떤 5개가
  // 뽑히든 데이터에는 영향이 없다.
  // step은 계산에 직접 쓰이진 않지만, 키워드가 바뀔 때만 다시 뽑기 위한 재계산 트리거다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shownIndexes = useMemo(() => current ? shuffle([...current.styleIds]).slice(0, CANDIDATES_PER_KEYWORD) : [], [step, current]);
  const isLast = step === CATALOG.length - 1;
  const selected = current ? selections[current.slug] : undefined;
  const finished = tally !== null;
  const majorityThreshold = Math.ceil(CATALOG.length / 2);

  async function handleSelect(index: number) {
    if (!current) return;
    setSelections((prev) => ({ ...prev, [current.slug]: index }));
    // 다른 사람들은 이 그림을 얼마나 골랐는지 바로 보여준다. 실패해도 조용히 넘어간다 —
    // 없어도 그만인 부가 정보라 투표 자체를 막을 이유는 아니다.
    try {
      const response = await fetch("/api/votes");
      const data = await readJson(response);
      if (response.ok && data?.tally) setLiveTally(data.tally as Tally);
    } catch {
      // 무시
    }
  }

  async function handleNext() {
    if (selected === undefined || submitting) return;

    if (!isLast) {
      setLiveTally(null);
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const candidateIds = CATALOG.map((keyword) =>
        candidateId(keyword.slug, selections[keyword.slug])
      );
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data?.error ?? "투표를 저장하지 못했습니다.");
      setTally((data.tally ?? {}) as Tally);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "투표를 저장하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRestart() {
    setStep(0);
    setSelections({});
    setTally(null);
    setLiveTally(null);
    setErrorMessage(null);
  }

  if (!started) {
    const fanRotations = [-16, -8, 0, 8, 16];
    return (
      <Shell wide>
        <Card className="animate-in zoom-in-95 fade-in items-center gap-8 border-2 bg-card/90 p-8 text-center shadow-2xl shadow-primary/20 backdrop-blur-xl duration-500 sm:p-12">
          <div className="flex h-32 w-full items-center justify-center">
            {CATALOG.map((keyword, i) => (
              <div
                key={keyword.slug}
                className="animate-in fade-in zoom-in-50 -mx-4 flex size-24 items-center justify-center rounded-2xl bg-card p-2 shadow-xl ring-2 ring-primary/20 duration-700 sm:size-28"
                style={{
                  transform: `rotate(${fanRotations[i]}deg) translateY(${Math.abs(fanRotations[i]) * 0.6}px)`,
                  animationDelay: `${i * 100}ms`,
                  zIndex: i === 2 ? 10 : 5 - Math.abs(i - 2),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={candidateSrc(keyword.slug, keyword.styleIds[0])}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <h1 className="font-heading text-5xl font-extrabold text-foreground drop-shadow-sm">
              당신의 미감 테스트
            </h1>
            <Badge className="rounded-full px-4 py-1 text-base font-heading shadow-md shadow-primary/40">
              나의 미감, 주류 vs 비주류
            </Badge>
            <p className="max-w-xs text-sm text-muted-foreground">
              그림 5장 중 마음에 드는 딱 1개만 골라주세요. 내 취향이 남들과
              같을지, 나만 다를지 확인해봐요 🤔
            </p>
            <p className="max-w-xs text-xs text-muted-foreground/70">
              키워드는 미리캔버스·Adobe Stock·Pinterest 같은 트렌드 소스를
              참고해 시즌 선행성·상표권 여부를 기준으로 고릅니다.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setStarted(true)}
            className="w-full max-w-xs scale-100 rounded-full text-base shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/50 active:scale-95"
          >
            시작하기 ✨
          </Button>
        </Card>
      </Shell>
    );
  }

  if (finished) {
    const matches = countMatches(selections, tally);
    const isMainstream = matches >= majorityThreshold;
    return (
      <Shell wide>
        <Card className="animate-in zoom-in-95 fade-in gap-6 border-2 bg-card/90 p-6 shadow-2xl shadow-primary/20 backdrop-blur-xl duration-500 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="animate-bounce text-6xl drop-shadow-lg [animation-duration:1.2s]">
              {isMainstream ? "😎" : "🦄"}
            </span>
            <h1 className="font-heading text-4xl font-extrabold text-foreground drop-shadow-sm">
              당신은 {isMainstream ? "주류" : "비주류"}!
            </h1>
            <Badge className="rounded-full px-4 py-1 text-sm font-heading shadow-md shadow-primary/40">
              {matches}/{CATALOG.length}개, 다수 의견과 일치
            </Badge>
            <p className="max-w-xs text-sm text-muted-foreground">
              {isMainstream
                ? "당신의 미감은 대중적이에요 — 사람들이 좋아하는 걸 잘 알아보시네요!"
                : "당신의 미감은 남달라요 — 확실한 나만의 취향이 있으시네요!"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {CATALOG.map((keyword, i) => {
              const mine = selections[keyword.slug];
              const top = topChoice(keyword.slug, indexes, tally);
              const matched = top !== null && mine === top;
              return (
                <div
                  key={keyword.slug}
                  className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-3 rounded-2xl bg-muted/60 p-4 shadow-inner ring-1 ring-foreground/5"
                  style={{ animationDelay: `${i * 80}ms`, animationDuration: "400ms" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-base text-foreground">
                      {keyword.emoji} {keyword.label}
                    </span>
                    <Badge
                      variant={matched ? "default" : "secondary"}
                      className={matched ? "shadow-sm shadow-primary/40" : "shadow-sm"}
                    >
                      {matched ? "다수 의견과 같음" : "나만의 취향"}
                    </Badge>
                  </div>
                  <div className="flex gap-4">
                    <ResultThumb label="내 선택" slug={keyword.slug} index={mine} />
                    {top !== null && (
                      <ResultThumb label="다수 선택" slug={keyword.slug} index={top} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={handleRestart}
            className="w-fit self-center rounded-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            다시 하기 🔁
          </Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell wide>
      <Card
        key={step}
        className="animate-in fade-in slide-in-from-right-8 gap-6 border-2 bg-card/90 p-6 shadow-2xl shadow-primary/20 backdrop-blur-xl duration-300 sm:p-8"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-heading text-3xl font-extrabold text-foreground drop-shadow-sm">
              {current.emoji} {current.label}
            </h1>
            <Badge variant="secondary" className="rounded-full shadow-sm">
              {step + 1} / {CATALOG.length}
            </Badge>
          </div>
          <Progress value={((step + 1) / CATALOG.length) * 100} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {shownIndexes.map((index, i) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              aria-pressed={selected === index}
              aria-label={`${current.label} ${index}번 후보`}
              style={{ animationDelay: `${i * 60}ms`, animationDuration: "350ms" }}
              className={`animate-in fade-in zoom-in-95 relative flex aspect-square items-center justify-center rounded-2xl bg-card p-3 shadow-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg active:scale-95 ${
                selected === index
                  ? "-translate-y-1 scale-[1.03] shadow-xl shadow-primary/50 ring-4 ring-primary/70"
                  : "ring-1 ring-foreground/10 hover:ring-primary/40"
              }`}
            >
              {selected === index && (
                <span className="animate-in zoom-in-50 absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow-md shadow-primary/50 duration-200">
                  ✓
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candidateSrc(current.slug, index)}
                alt=""
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>

        {selected !== undefined && (
          <LiveFeedback
            tally={liveTally}
            slug={current.slug}
            indexes={indexes}
            selectedIndex={selected}
          />
        )}

        {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

        <Button
          onClick={handleNext}
          disabled={selected === undefined || submitting}
          className="w-full scale-100 rounded-full shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/50 active:scale-95 sm:w-fit sm:self-center sm:px-10"
        >
          {submitting ? "저장 중..." : isLast ? "결과 보기 🎉" : "다음 →"}
        </Button>
      </Card>
    </Shell>
  );
}

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-10 font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--color-primary)/15%,transparent)]" />
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 animate-pulse rounded-full bg-primary/25 blur-3xl [animation-duration:4s]" />
      <div className="pointer-events-none absolute -right-32 top-1/4 size-96 animate-pulse rounded-full bg-chart-2/25 blur-3xl [animation-duration:5s] [animation-delay:1s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 size-80 animate-pulse rounded-full bg-chart-4/20 blur-3xl [animation-duration:6s] [animation-delay:2s]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <main className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</main>
    </div>
  );
}

function LiveFeedback({
  tally,
  slug,
  indexes,
  selectedIndex,
}: {
  tally: Tally | null;
  slug: string;
  indexes: number[];
  selectedIndex: number;
}) {
  if (!tally) return null;

  const total = indexes.reduce((sum, i) => sum + (tally[candidateId(slug, i)] ?? 0), 0);

  if (total === 0) {
    return (
      <p className="animate-in fade-in text-center text-sm text-muted-foreground duration-300">
        🥇 첫 투표예요! 아직 아무도 고르지 않은 그림이에요.
      </p>
    );
  }

  const votes = tally[candidateId(slug, selectedIndex)] ?? 0;
  const pct = Math.round((votes / total) * 100);

  return (
    <p className="animate-in fade-in zoom-in-95 text-center text-sm font-medium text-foreground duration-300">
      🔥 지금까지 참여한 사람 중 <span className="font-heading text-primary">{pct}%</span>가
      이 그림을 골랐어요!
    </p>
  );
}

function ResultThumb({
  label,
  slug,
  index,
}: {
  label: string;
  slug: string;
  index: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex size-24 items-center justify-center rounded-xl bg-card p-2 shadow-md ring-1 ring-foreground/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidateSrc(slug, index)}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

/** 득표가 가장 많은 후보. 표가 하나도 없으면 null. 동점이면 인덱스가 작은 쪽. */
function topChoice(slug: string, indexes: number[], tally: Tally): number | null {
  let best: number | null = null;
  let bestVotes = 0;
  for (const index of indexes) {
    const votes = tally[candidateId(slug, index)] ?? 0;
    if (votes > bestVotes) {
      best = index;
      bestVotes = votes;
    }
  }
  return best;
}

/** Fisher-Yates 셔플. 원본 배열은 건드리지 않는다. */
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function countMatches(selections: Selections, tally: Tally): number {
  const indexes = candidateIndexes();
  return CATALOG.filter((keyword) => {
    const top = topChoice(keyword.slug, indexes, tally);
    return top !== null && selections[keyword.slug] === top;
  }).length;
}

/** 서버가 빈 응답이나 비-JSON을 돌려줘도 화면이 원시 오류로 깨지지 않게 한다. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readJson(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
