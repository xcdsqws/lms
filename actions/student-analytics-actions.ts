import { format, parseISO } from "date-fns"

interface Evaluation {
  evaluation_date: string
  satisfaction_level: number
  achievement_level: number
  focus_level: number
}

interface StudentAnalytics {
  studentId: string
  selfEvaluations: Evaluation[]
}

export const getStudentAnalytics = async (studentId: string): Promise<StudentAnalytics> => {
  // Mock data for demonstration purposes
  const selfEvaluations: Evaluation[] = [
    {
      evaluation_date: "2024-01-15",
      satisfaction_level: 4,
      achievement_level: 5,
      focus_level: 3,
    },
    {
      evaluation_date: "2024-01-22",
      satisfaction_level: 3,
      achievement_level: 4,
      focus_level: 5,
    },
    {
      evaluation_date: "2024-01-29",
      satisfaction_level: 5,
      achievement_level: 3,
      focus_level: 4,
    },
    {
      evaluation_date: "2024-02-05",
      satisfaction_level: 2,
      achievement_level: 2,
      focus_level: 2,
    },
    {
      evaluation_date: "2024-02-12",
      satisfaction_level: 4,
      achievement_level: 5,
      focus_level: 3,
    },
  ]

  return {
    studentId: studentId,
    selfEvaluations: selfEvaluations,
  }
}

export const processStudentAnalytics = (studentAnalytics: StudentAnalytics) => {
  const { selfEvaluations } = studentAnalytics

  const evaluationAverages =
    selfEvaluations.length > 0
      ? {
          satisfaction:
            selfEvaluations.reduce((sum, evaluation) => sum + evaluation.satisfaction_level, 0) /
            selfEvaluations.length,
          achievement:
            selfEvaluations.reduce((sum, evaluation) => sum + evaluation.achievement_level, 0) / selfEvaluations.length,
          focus: selfEvaluations.reduce((sum, evaluation) => sum + evaluation.focus_level, 0) / selfEvaluations.length,
        }
      : null

  const evaluationTrends = selfEvaluations.map((evaluation) => ({
    date: evaluation.evaluation_date,
    formattedDate: format(parseISO(evaluation.evaluation_date), "M/d"),
    satisfaction: evaluation.satisfaction_level,
    achievement: evaluation.achievement_level,
    focus: evaluation.focus_level,
  }))

  return {
    evaluationAverages,
    evaluationTrends,
  }
}
