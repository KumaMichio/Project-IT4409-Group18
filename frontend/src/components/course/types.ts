export interface Asset {
  id: number;
  asset_kind: 'VIDEO' | 'PDF' | 'LINK';
  url: string;
  meta: any;
}

export interface Quiz {
  id: number;
  title: string;
  time_limit_s: number | null;
  attempts_allowed: number | null;
  pass_score: number;
}

export interface Lesson {
  id: number;
  title: string;
  position: number;
  duration_s: number | null;
  watched_s: number;
  is_completed: boolean;
  requires_quiz_pass: boolean;
  assets: Asset[];
  quiz: Quiz | null;
}

export interface Module {
  id: number;
  title: string;
  position: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
}
