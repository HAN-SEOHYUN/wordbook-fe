/**
 * TTS (Text-to-Speech) API 클라이언트
 * edge-tts를 통한 영어 발음 재생 기능 제공
 */

import config from '../config'

/**
 * TTS API 엔드포인트 생성
 * @param text - 발음할 텍스트
 * @returns TTS 오디오 스트림 URL
 */
const getTTSUrl = (text: string): string => {
  return `${config.apiBaseUrl}/api/v1/tts/speak?text=${encodeURIComponent(text)}`
}

/**
 * 텍스트를 음성으로 재생
 * @param text - 발음할 텍스트
 * @throws Error - 재생 실패 시
 */
const speak = async (text: string): Promise<void> => {
  const audio = new Audio(getTTSUrl(text))
  await audio.play()
}

export const ttsAPI = {
  getTTSUrl,
  speak,
}
