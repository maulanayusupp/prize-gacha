import type { Prize } from '~/types/gacha'

export type ShareResult =
  | 'shared-with-image'
  | 'shared-text-only'
  | 'copied-and-downloaded'
  | 'copied'
  | 'aborted'

export function useShare() {
  const { buildCanvas, toBlob } = useShareCard()

  async function downloadImage(prize: Prize, userName: string, filename: string) {
    const canvas = await buildCanvas(prize, userName)
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async function shareImage(prize: Prize, userName: string, text: string): Promise<ShareResult> {
    const canvas = await buildCanvas(prize, userName)

    // 1) Try Web Share API with file (best — sends image + text)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
      try {
        const blob = await toBlob(canvas)
        const file = new File([blob], 'prize-gacha.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'Prize Gacha', text, files: [file] })
          return 'shared-with-image'
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return 'aborted'
        // fall through
      }
    }

    // 2) Try Web Share API without file (text only)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Prize Gacha', text })
        return 'shared-text-only'
      } catch (e: any) {
        if (e?.name === 'AbortError') return 'aborted'
      }
    }

    // 3) Final fallback: copy text + auto-download image so user has something to share
    let copied = false
    try {
      await navigator.clipboard.writeText(text)
      copied = true
    } catch {}

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'prize-gacha.png'
    link.href = url
    document.body.appendChild(link)
    link.click()
    link.remove()

    return copied ? 'copied-and-downloaded' : 'copied-and-downloaded'
  }

  return { downloadImage, shareImage }
}
