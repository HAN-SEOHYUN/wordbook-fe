import type { VocabularyResponse, VocabularyCreate, VocabularyUpdate, VocabularyListResponse } from '@/types/vocabulary'

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
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/vocabulary/dates`)
      
      if (!response.ok) {
        // 응답 본문에서 상세 오류 메시지 추출 시도
        let errorMessage = `Failed to fetch available dates: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail || errorData.message) {
            errorMessage += ` - ${errorData.detail || errorData.message}`
          }
        } catch {
          // JSON 파싱 실패 시 텍스트로 시도
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage += ` - ${errorText}`
            }
          } catch {
            // 무시
          }
        }
        throw new Error(errorMessage)
      }
      
      return response.json()
    } catch (error) {
      // 네트워크 오류 등 fetch 자체가 실패한 경우
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: 백엔드 서버(${this.baseUrl})에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.`)
      }
      throw error
    }
  }

  /**
   * 특정 날짜의 단어 목록 조회 (날짜 + source_url + 단어 목록 포함)
   */
  async getVocabularyByDate(
    targetDate: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<VocabularyListResponse> {
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