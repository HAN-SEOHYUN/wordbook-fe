import type { UserListResponse } from '@/types/test'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class UsersAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * 모든 사용자 목록 조회
   */
  async getAllUsers(): Promise<UserListResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/users`)

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }

    return response.json()
  }
}

// 싱글톤 인스턴스 export
export const usersAPI = new UsersAPI()
