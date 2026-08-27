import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";
import { CATALOG } from "@/lib/illustration/catalog";

function start() {
  fireEvent.click(screen.getByRole("button", { name: /시작하기/ }));
}

/**
 * 화풍은 8개 풀에서 키워드마다 무작위 5개만 보여주므로, 특정 번호("1번")가 항상 있다고
 * 가정할 수 없다. 그 키워드에 실제로 렌더링된 후보 중 아무거나(첫 번째) 골라 클릭한다.
 */
function pickAnyCandidate(keywordIndex: number) {
  const label = CATALOG[keywordIndex].label;
  const [firstCandidate] = screen.getAllByRole("button", {
    name: new RegExp(`^${label} \\d+번 후보$`),
  });
  fireEvent.click(firstCandidate);
}

test("첫 화면은 인트로와 시작하기 버튼을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "당신의 미감 테스트" })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /시작하기/ })).toBeInTheDocument();
});

test("시작하기를 누르면 첫 번째 키워드와 진행 상황을 보여준다", () => {
  render(<Home />);
  start();

  expect(
    screen.getByRole("heading", { level: 1, name: new RegExp(CATALOG[0].label) })
  ).toBeInTheDocument();
  expect(screen.getByText(`1 / ${CATALOG.length}`)).toBeInTheDocument();
});

test("아무것도 고르지 않으면 다음 버튼이 비활성화된다", () => {
  render(<Home />);
  start();

  expect(screen.getByRole("button", { name: /다음/ })).toBeDisabled();
});

test("후보를 고르면 다음 버튼이 활성화되고 다음 키워드로 넘어간다", () => {
  render(<Home />);
  start();

  pickAnyCandidate(0);

  const next = screen.getByRole("button", { name: /다음/ });
  expect(next).not.toBeDisabled();

  fireEvent.click(next);

  expect(
    screen.getByRole("heading", { level: 1, name: new RegExp(CATALOG[1].label) })
  ).toBeInTheDocument();
});

test("마지막 키워드에서는 버튼 문구가 결과 보기로 바뀐다", () => {
  render(<Home />);
  start();

  for (let i = 0; i < CATALOG.length - 1; i++) {
    pickAnyCandidate(i);
    fireEvent.click(screen.getByRole("button", { name: /다음/ }));
  }

  pickAnyCandidate(CATALOG.length - 1);

  expect(screen.getByRole("button", { name: /결과 보기/ })).toBeInTheDocument();
});
