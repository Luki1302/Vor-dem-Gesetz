export type ThemeMode = 'light' | 'dark'

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const useTheme = () => {
  const mode = useState<ThemeMode>('theme', () => getSystemTheme())

  const setMode = (m: ThemeMode) => {
    mode.value = m
  }

  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      mode.value = e.matches ? 'dark' : 'light'
    })
  }

  return { mode, setMode }
}
