import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { VocabularyResponse, Word } from '@/types/vocabulary'

// shadcn/ui의 기본 유틸리티 함수
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vocabulary 관련 유틸리티 함수들

/**
 * API 응답(VocabularyResponse)을 컴포넌트에서 사용하는 Word 타입으로 변환
 */
export function vocabularyResponseToWord(vocab: VocabularyResponse): Word {
  return {
    id: vocab.id,
    english: vocab.english_word,
    korean: vocab.korean_meaning,
  }
}

/**
 * 여러 개의 VocabularyResponse를 Word 배열로 변환
 */
export function vocabularyResponsesToWords(vocabs: VocabularyResponse[]): Word[] {
  return vocabs.map(vocabularyResponseToWord)
}