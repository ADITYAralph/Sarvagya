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
