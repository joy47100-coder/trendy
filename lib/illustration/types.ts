export interface GenerateResult {
  keyword: string;
  index: number;
  svg?: string;
  error?: string;
}

export interface Candidate {
  id: string;
  keyword: string;
  variationIndex: number;
  svg: string | null;
  error: string | null;
  voteCount: number;
}

export interface BatchDetail {
  batchId: string;
  keywords: string[];
  candidatesByKeyword: Record<string, Candidate[]>;
}
