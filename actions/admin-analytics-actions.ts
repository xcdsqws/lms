import { db } from "@/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const getAnalyticsData = async () => {
  try {
    const { getUser } = getKindeServerSession()
    const user = getUser()

    if (!user || user.id !== process.env.ADMIN_USER_ID) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    const totalUsers = await db.user.count()
    const totalDocuments = await db.document.count()
    const totalSelfEvaluations = await db.selfEvaluation.count()

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const newUsersLastMonth = await db.user.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const newDocumentsLastMonth = await db.document.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const newSelfEvaluationsLastMonth = await db.selfEvaluation.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const selfEvaluations = await db.selfEvaluation.findMany()

    const evaluationAverages =
      selfEvaluations.length > 0
        ? {
            satisfaction:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.satisfaction_level, 0) /
              selfEvaluations.length,
            achievement:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.achievement_level, 0) /
              selfEvaluations.length,
            focus:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.focus_level, 0) / selfEvaluations.length,
          }
        : null

    return {
      success: true,
      message: "Analytics data retrieved successfully",
      data: {
        totalUsers,
        totalDocuments,
        totalSelfEvaluations,
        newUsersLastMonth,
        newDocumentsLastMonth,
        newSelfEvaluationsLastMonth,
        evaluationAverages,
      },
    }
  } catch (error) {
    console.error("[GET_ANALYTICS_DATA]", error)
    return {
      success: false,
      message: "Failed to retrieve analytics data",
      data: null,
    }
  }
}
