import type { VocabularyResponse, VocabularyCreate, VocabularyUpdate } from '@/types/vocabulary'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class VocabularyAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * 사용 가능한 날짜 목록 조회 (최신순 5개)
   */
  async getAvailableDates(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/dates`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available dates: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * 특정 날짜의 단어 목록 조회
   */
  async getVocabularyByDate(
    targetDate: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<VocabularyResponse[]> {
    const params = new URLSearchParams({
      target_date: targetDate,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * 특정 ID의 단어 조회
   */
  async getVocabularyById(wordId: number): Promise<VocabularyResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/${wordId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary item: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * 단어 생성 또는 업데이트 (UPSERT)
   */
  async createVocabulary(data: VocabularyCreate): Promise<VocabularyResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create vocabulary: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * 단어 업데이트
   */
  async updateVocabulary(wordId: number, data: VocabularyUpdate): Promise<VocabularyResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/${wordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update vocabulary: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * 단어 삭제
   */
  async deleteVocabulary(wordId: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/${wordId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete vocabulary: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// 싱글톤 인스턴스 export
export const vocabularyAPI = new VocabularyAPI()