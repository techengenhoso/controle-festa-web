import { useCallback, useEffect, useRef, useState } from "react"

type NfcReader = {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>
  onreading: ((event: NfcReadingEvent) => void) | null
  onreadingerror: (() => void) | null
}

type NfcReadingEvent = {
  serialNumber?: string
  message?: {
    records?: NfcRecord[]
  }
}

type NfcRecord = {
  recordType?: string
  data?: DataView
  encoding?: string
}
type NdefReaderConstructor = new () => NfcReader

declare global {
  interface Window {
    NDEFReader?: NdefReaderConstructor
  }
}

type NfcScannerStatus = "unsupported" | "idle" | "scanning" | "error"

type UseNfcCardScannerOptions = {
  enabled: boolean
  onCardDetected: (cardId: string) => void
  onReadError?: () => void
  onStartError?: (message: string) => void
}

function decodeRecord(record: NfcRecord) {
  if (!record.data) return ""
  const encoding = record.encoding || "utf-8"
  const bytes = new Uint8Array(record.data.buffer)

  if (record.recordType === "text" && bytes.length > 1) {
    const languageCodeLength = bytes[0] & 0x3f
    return new TextDecoder(encoding).decode(bytes.slice(1 + languageCodeLength))
  }

  return new TextDecoder(encoding).decode(bytes)
}

function extractCardIds(event: NfcReadingEvent) {
  return [event.serialNumber, ...(event.message?.records ?? []).map(decodeRecord)]
    .map(value => value?.trim())
    .filter((value): value is string => Boolean(value))
}

export function useNfcCardScanner({
  enabled,
  onCardDetected,
  onReadError,
  onStartError,
}: UseNfcCardScannerOptions) {
  const [status, setStatus] = useState<NfcScannerStatus>(() =>
    "NDEFReader" in window ? "idle" : "unsupported"
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const onCardDetectedRef = useRef(onCardDetected)
  const onReadErrorRef = useRef(onReadError)
  const onStartErrorRef = useRef(onStartError)

  useEffect(() => {
    onCardDetectedRef.current = onCardDetected
    onReadErrorRef.current = onReadError
    onStartErrorRef.current = onStartError
  }, [onCardDetected, onReadError, onStartError])

  const start = useCallback(async () => {
    if (!enabled || !window.NDEFReader) {
      setStatus("unsupported")
      return
    }

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const reader = new window.NDEFReader()
    reader.onreading = event => {
      const [cardId] = extractCardIds(event)
      if (cardId) onCardDetectedRef.current(cardId)
    }
    reader.onreadingerror = () => onReadErrorRef.current?.()

    try {
      await reader.scan({ signal: abortController.signal })
      setStatus("scanning")
    } catch (error) {
      if (abortController.signal.aborted) return
      setStatus("error")
      onStartErrorRef.current?.(
        error instanceof Error ? error.message : "Não foi possível iniciar o NFC."
      )
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    void start()
    return () => abortControllerRef.current?.abort()
  }, [enabled, start])

  return { start, status }
}
