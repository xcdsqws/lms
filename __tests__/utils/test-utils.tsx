import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"

// 테스트에 필요한 프로바이더를 포함한 래퍼 컴포넌트
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// 커스텀 렌더 함수
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// 테스트에서 사용할 모의 데이터 생성 함수
const createMockUser = (overrides = {}) => ({
  id: "user-123",
  full_name: "홍길동",
  username: "hong@example.com",
  role: "student",
  ...overrides,
})

const createMockSubject = (overrides = {}) => ({
  id: "subject-123",
  name: "수학",
  description: "수학 과목",
  ...overrides,
})

const createMockStudyLog = (overrides = {}) => ({
  id: "log-123",
  student_id: "user-123",
  subject_id: "subject-123",
  content: "수학 공부",
  study_date: "2023-01-01",
  created_at: "2023-01-01T12:00:00Z",
  updated_at: "2023-01-01T12:00:00Z",
  subjects: { name: "수학" },
  ...overrides,
})

const createMockStudyTimeLog = (overrides = {}) => ({
  id: "time-log-123",
  student_id: "user-123",
  subject_id: "subject-123",
  start_time: "2023-01-01T12:00:00Z",
  end_time: "2023-01-01T13:00:00Z",
  duration_minutes: 60,
  study_date: "2023-01-01",
  created_at: "2023-01-01T12:00:00Z",
  subjects: { name: "수학" },
  ...overrides,
})

const createMockSelfEvaluation = (overrides = {}) => ({
  id: "eval-123",
  student_id: "user-123",
  evaluation_date: "2023-01-01",
  satisfaction_level: 4,
  achievement_level: 3,
  focus_level: 5,
  reflection: "오늘 공부 잘했다",
  goals_for_tomorrow: "내일은 더 열심히",
  created_at: "2023-01-01T12:00:00Z",
  updated_at: "2023-01-01T12:00:00Z",
  ...overrides,
})

// 모든 유틸리티 함수 내보내기
export {
  customRender,
  createMockUser,
  createMockSubject,
  createMockStudyLog,
  createMockStudyTimeLog,
  createMockSelfEvaluation,
}

// testing-library의 모든 함수 다시 내보내기
export * from "@testing-library/react"
