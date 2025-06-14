import { useRef, useCallback, useEffect, useState } from 'react'
import { AudioManager, AudioSettings } from '../audio/AudioManager'

export const useAudioSystem = () => {
  const audioManager = useRef<AudioManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 0.7,
    effectsVolume: 0.8,
    musicVolume: 0.5,
    muted: false
  })

  // 初期化
  useEffect(() => {
    audioManager.current = new AudioManager()
    
    // ローカルストレージから設定を復元
    const savedSettings = localStorage.getItem('audioSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        audioManager.current.applySettings(parsed)
      } catch (error) {
        console.warn('Failed to load audio settings:', error)
      }
    }

    return () => {
      if (audioManager.current) {
        audioManager.current.dispose()
      }
    }
  }, [])

  // ユーザー操作による音響初期化
  const initializeAudio = useCallback(async () => {
    if (audioManager.current && !isInitialized) {
      try {
        await audioManager.current.initializeOnUserAction()
        setIsInitialized(audioManager.current.isInitialized())
      } catch (error) {
        console.warn('Failed to initialize audio:', error)
      }
    }
  }, [isInitialized])

  // === 効果音再生 ===

  const playShootSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playShootSound()
    }
  }, [])

  const playExplosionSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playExplosionSound()
    }
  }, [])

  const playPowerUpSound = useCallback((isGood: boolean) => {
    if (audioManager.current) {
      if (isGood) {
        audioManager.current.playPowerUpGoodSound()
      } else {
        audioManager.current.playPowerUpBadSound()
      }
    }
  }, [])

  const playDamageSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playDamageSound()
    }
  }, [])

  const playAchievementSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playAchievementSound()
    }
  }, [])

  const playLevelUpSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playLevelUpSound()
    }
  }, [])

  const playGameOverSound = useCallback(() => {
    if (audioManager.current) {
      audioManager.current.playGameOverSound()
    }
  }, [])

  // === 設定管理 ===

  const setMasterVolume = useCallback((volume: number) => {
    if (audioManager.current) {
      audioManager.current.setMasterVolume(volume)
      const newSettings = { ...settings, masterVolume: volume }
      setSettings(newSettings)
      localStorage.setItem('audioSettings', JSON.stringify(newSettings))
    }
  }, [settings])

  const setEffectsVolume = useCallback((volume: number) => {
    if (audioManager.current) {
      audioManager.current.setEffectsVolume(volume)
      const newSettings = { ...settings, effectsVolume: volume }
      setSettings(newSettings)
      localStorage.setItem('audioSettings', JSON.stringify(newSettings))
    }
  }, [settings])

  const setMusicVolume = useCallback((volume: number) => {
    if (audioManager.current) {
      audioManager.current.setMusicVolume(volume)
      const newSettings = { ...settings, musicVolume: volume }
      setSettings(newSettings)
      localStorage.setItem('audioSettings', JSON.stringify(newSettings))
    }
  }, [settings])

  const toggleMute = useCallback(() => {
    if (audioManager.current) {
      const muted = audioManager.current.toggleMute()
      const newSettings = { ...settings, muted }
      setSettings(newSettings)
      localStorage.setItem('audioSettings', JSON.stringify(newSettings))
      return muted
    }
    return settings.muted
  }, [settings])

  const setMuted = useCallback((muted: boolean) => {
    if (audioManager.current) {
      audioManager.current.setMuted(muted)
      const newSettings = { ...settings, muted }
      setSettings(newSettings)
      localStorage.setItem('audioSettings', JSON.stringify(newSettings))
    }
  }, [settings])

  // === ゲーム統合用ヘルパー ===

  // 敵タイプ別爆発音
  const playEnemyDestroySound = useCallback((enemyType: string) => {
    if (audioManager.current) {
      // 敵タイプに応じて音量調整
      switch (enemyType) {
        case 'Basic':
        case 'Fast':
          audioManager.current.playExplosionSound()
          break
        case 'Tank':
          // より大きな爆発音
          audioManager.current.playSound('explosion', 1.2)
          break
        case 'Boss':
          // 最大爆発音
          audioManager.current.playSound('explosion', 1.5)
          break
        default:
          audioManager.current.playExplosionSound()
      }
    }
  }, [])

  // レベル変化時の音響調整
  const onLevelChange = useCallback((newLevel: number) => {
    if (newLevel > 1) {
      playLevelUpSound()
    }
  }, [playLevelUpSound])

  // 実績解除時の音響
  const onAchievementUnlocked = useCallback(() => {
    playAchievementSound()
  }, [playAchievementSound])

  // ゲーム状態変化時の音響
  const onGameStateChange = useCallback((newState: 'playing' | 'paused' | 'game_over' | 'menu') => {
    switch (newState) {
      case 'game_over':
        playGameOverSound()
        break
      // 他の状態では特別な音響なし
    }
  }, [playGameOverSound])

  return {
    // 初期化
    initializeAudio,
    isInitialized,
    
    // 効果音
    playShootSound,
    playExplosionSound,
    playPowerUpSound,
    playDamageSound,
    playAchievementSound,
    playLevelUpSound,
    playGameOverSound,
    playEnemyDestroySound,
    
    // 設定
    settings,
    setMasterVolume,
    setEffectsVolume,
    setMusicVolume,
    toggleMute,
    setMuted,
    
    // ゲーム統合
    onLevelChange,
    onAchievementUnlocked,
    onGameStateChange
  }
}