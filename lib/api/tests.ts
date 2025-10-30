import type {
  TestStartRequest,
  TestStartResponse,
  TestSubmitRequest,
  TestSubmitResponse,
  TestAvailabilityResponse
} from '@/types/test'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class TestsAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * 시험 시작 (신규 생성 또는 재시험)
   */
  async startTest(data: TestStartRequest): Promise<TestStartResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/tests/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to start test: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 답안 제출 및 자동 채점
   */
  async submitTest(trId: number, data: TestSubmitRequest): Promise<TestSubmitResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/tests/${trId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit test: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 현재 시험 가능 여부 확인
   */
  async getCurrentAvailability(): Promise<TestAvailabilityResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/tests/current-availability`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check test availability: ${response.statusText}`)
    }

    return response.json()
  }
}

// 싱글톤 인스턴스 export
export const testsAPI = new TestsAPI()
