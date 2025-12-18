/**
 * TTS (Text-to-Speech) 커스텀 훅
 * 영어 발음 재생 기능을 컴포넌트에서 쉽게 사용할 수 있도록 제공
 */

import { useCallback, useState } from 'react'
import { ttsAPI } from '@/lib/api/tts'

interface UseTTSOptions {
  /** 에러 발생 시 호출되는 콜백 */
  onError?: (error: Error) => void
}

interface UseTTSReturn {
  /** 텍스트를 음성으로 재생 */
  speak: (text: string) => Promise<void>
  /** 이벤트 핸들러용 speak (e.stopPropagation 포함) */
  speakWithEvent: (text: string, e: React.MouseEvent) => Promise<void>
  /** 재생 중 여부 */
  isSpeaking: boolean
}

/**
 * TTS 기능을 제공하는 커스텀 훅
 * @param options - 옵션 객체
 * @returns TTS 관련 함수 및 상태
 * 
 * @example
 * ```tsx
 * const { speak, speakWithEvent, isSpeaking } = useTTS({
 *   onError: (error) => showToast('음성 재생에 실패했습니다', 'error')
 * })
 * 
 * // 직접 호출
 * await speak('hello')
 * 
 * // 이벤트 핸들러에서 사용 (버블링 방지 포함)
 * <button onClick={(e) => speakWithEvent('hello', e)}>
 * ```
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { onError } = options
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return
    
    setIsSpeaking(true)
    try {
      await ttsAPI.speak(text)
    } catch (error) {
      console.error('TTS playback error:', error)
      onError?.(error instanceof Error ? error : new Error('TTS 재생 실패'))
    } finally {
      setIsSpeaking(false)
    }
  }, [onError])

  const speakWithEvent = useCallback(async (text: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    await speak(text)
  }, [speak])

  return {
    speak,
    speakWithEvent,
    isSpeaking,
  }
}
