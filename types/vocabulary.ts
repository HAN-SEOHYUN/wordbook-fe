export interface VocabularyResponse {
  id: number
  english_word: string
  korean_meaning: string
  date: string // YYYY-MM-DD format
  created_at: string
  updated_at: string
}

export interface VocabularyCreate {
  english_word: string
  korean_meaning: string
  date: string
}

export interface VocabularyUpdate {
  english_word: string
  korean_meaning: string
}

// 컴포넌트에서 사용할 간소화된 타입
export interface Word {
  id: number
  english: string
  korean: string
}