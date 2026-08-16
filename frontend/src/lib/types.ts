export interface DashboardStats {
  user_name: string;
  target_role: string;
  readiness_score: number;
  ats_resume_score: number;
  mock_interview_score: number;
  aptitude_score: number;
  streak_count: number;
  total_practice_hours: number;
  weak_areas: string[];
  recent_activities: Array<{
    type: string;
    title: string;
    score: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

export interface ResumeAnalysisResult {
  id?: number;
  filename: string;
  target_role: string;
  is_valid?: boolean;
  error_message?: string;
  overall_score: number;
  formatting_score: number;
  skills_score: number;
  impact_score: number;
  relevance_score: number;
  matching_skills: string[];
  missing_keywords: string[];
  strengths: string[];
  suggestions: string[];
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  focus_area: string;
  hints: string[];
}

export interface QuestionsResponse {
  role: string;
  level: string;
  total_questions: number;
  questions: InterviewQuestion[];
}

export interface AnswerEvalResult {
  score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  feedback: string;
  model_answer: string;
  key_takeaways: string[];
}

export interface DailyTask {
  day: string;
  topic: string;
  task: string;
  problem: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  focus_areas: string[];
  daily_tasks: DailyTask[];
}

export interface RoadmapResponse {
  target_role: string;
  duration_weeks: number;
  overall_strategy: string;
  weeks: RoadmapWeek[];
}

export interface AptitudeQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
}

export interface CodeEvaluation {
  is_correct: boolean;
  score: number;
  time_complexity: string;
  space_complexity: string;
  feedback: string;
  code_quality: string;
  suggestions: string[];
  optimized_code: string;
}

// ─── JD Match Result ─────────────────────────────────────

export interface JDMatchResult {
  jd_match_score: number;
  present_keywords: string[];
  missing_required: string[];
  missing_preferred: string[];
  partial_matches: string[];
  education_gap: string | null;
  experience_gap: string | null;
  jd_recommendations: string[];
  match_mode: 'preset' | 'custom' | 'none';
  role_name: string;
}

// ─── Deep ATS Analysis Types ──────────────────────────────

export interface WordAnnotation {
  word: string;
  classification: 'strong_keyword' | 'action_verb' | 'metric' | 'filler' | 'buzzword' | 'neutral';
  impact_score: number;
  line: number;
  position: number;
}

export interface SectionScore {
  section_name: string;
  score: number;
  keyword_density: number;
  action_verb_count: number;
  metric_count: number;
  filler_count: number;
  feedback: string;
}

export interface WeakPhrase {
  phrase: string;
  location: string;
  line: number;
  char_start: number;
  rewrite: string;
}

export interface ATSDeepAnalysis {
  overall_score: number;
  grade: string;
  // 12 dimensions
  keyword_match_score: number;
  action_verb_score: number;
  quantified_impact_score: number;
  section_completeness_score: number;
  formatting_score: number;
  readability_score: number;
  relevance_score: number;
  brevity_score: number;
  technical_depth_score: number;
  ats_parsability_score: number;
  consistency_score: number;
  professional_tone_score: number;
  // Word-level
  word_annotations: WordAnnotation[];
  total_words: number;
  strong_keyword_count: number;
  action_verb_count: number;
  metric_count: number;
  filler_count: number;
  // Section data
  section_scores: SectionScore[];
  // Actionable
  matching_skills: string[];
  missing_keywords: string[];
  weak_phrases: WeakPhrase[];
  strengths: string[];
  suggestions: string[];
  // Resume text
  resume_text: string;
  // Metadata
  filename?: string;
  target_role?: string;
  is_valid?: boolean;
  error_message?: string;
  // JD Gap Analysis (optional)
  jd_match?: JDMatchResult;
}

