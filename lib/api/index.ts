/**
 * 통합 API 클라이언트
 * 모든 API를 한 곳에서 import하여 사용 가능
 */

export { vocabularyAPI } from './vocabulary'
export { usersAPI } from './users'
export { testWeeksAPI } from './test-weeks'
export { testsAPI } from './tests'
export { ttsAPI } from './tts'

// 편의를 위한 통합 객체
import { vocabularyAPI } from './vocabulary'
import { usersAPI } from './users'
import { testWeeksAPI } from './test-weeks'
import { testsAPI } from './tests'
import { ttsAPI } from './tts'

export const api = {
  vocabulary: vocabularyAPI,
  users: usersAPI,
  testWeeks: testWeeksAPI,
  tests: testsAPI,
  tts: ttsAPI,
}
