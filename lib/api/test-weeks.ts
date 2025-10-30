import type { TestWeekListResponse, TestWeekWordsResponse } from '@/types/test'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class TestWeeksAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * 시험 주차 목록 조회
   */
  async getTestWeeks(limit: number = 10, order: 'desc' | 'asc' = 'desc'): Promise<TestWeekListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      order: order,
    })

    const response = await fetch(`${this.baseUrl}/api/v1/test-weeks?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch test weeks: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 특정 주차의 단어 목록 조회
   */
  async getTestWeekWords(twiId: number): Promise<TestWeekWordsResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/test-weeks/${twiId}/words`)

    if (!response.ok) {
      throw new Error(`Failed to fetch test week words: ${response.statusText}`)
    }

    return response.json()
  }
}

// 싱글톤 인스턴스 export
export const testWeeksAPI = new TestWeeksAPI()
