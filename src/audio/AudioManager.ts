// Web Audio API音響管理システム

export interface AudioSettings {
  masterVolume: number // 0.0 - 1.0
  effectsVolume: number // 0.0 - 1.0
  musicVolume: number // 0.0 - 1.0
  muted: boolean
}

export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private effectsGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private initialized = false
  private settings: AudioSettings = {
    masterVolume: 0.7,
    effectsVolume: 0.8,
    musicVolume: 0.5,
    muted: false
  }

  // 音響バッファーキャッシュ
  private audioBuffers = new Map<string, AudioBuffer>()
  private loadingPromises = new Map<string, Promise<AudioBuffer>>()

  // 初期化
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Web Audio Context作成
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // ゲインノード設定
      this.masterGain = this.audioContext.createGain()
      this.effectsGain = this.audioContext.createGain()
      this.musicGain = this.audioContext.createGain()

      // オーディオグラフ接続
      this.effectsGain.connect(this.masterGain)
      this.musicGain.connect(this.masterGain)
      this.masterGain.connect(this.audioContext.destination)

      // 初期音量設定
      this.updateVolumes()

      // プリセット音響の生成
      await this.generateSounds()

      this.initialized = true
      console.log('AudioManager initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize AudioManager:', error)
    }
  }

  // ユーザー操作による初期化（ブラウザの制限対応）
  async initializeOnUserAction(): Promise<void> {
    if (!this.audioContext) {
      await this.initialize()
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // プリセット音響の生成（プロシージャル生成）
  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return

    // 射撃音
    this.audioBuffers.set('shoot', this.generateShootSound())
    
    // 爆発音
    this.audioBuffers.set('explosion', this.generateExplosionSound())
    
    // パワーアップ音（良い）
    this.audioBuffers.set('powerup_good', this.generatePowerUpSound(true))
    
    // パワーアップ音（悪い）
    this.audioBuffers.set('powerup_bad', this.generatePowerUpSound(false))
    
    // ダメージ音
    this.audioBuffers.set('damage', this.generateDamageSound())
    
    // 実績解除音
    this.audioBuffers.set('achievement', this.generateAchievementSound())
    
    // レベルアップ音
    this.audioBuffers.set('levelup', this.generateLevelUpSound())
    
    // ゲームオーバー音
    this.audioBuffers.set('gameover', this.generateGameOverSound())
  }

  // 射撃音生成
  private generateShootSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 0.1
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 短いホワイトノイズバースト
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 20)
      data[i] = noise * 0.3
    }

    return buffer
  }

  // 爆発音生成
  private generateExplosionSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 0.5
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // ノイズ + 低周波数ランブル
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 3)
      const rumble = Math.sin(t * 60 * Math.PI * 2) * Math.exp(-t * 2)
      data[i] = (noise * 0.6 + rumble * 0.4) * 0.5
    }

    return buffer
  }

  // パワーアップ音生成
  private generatePowerUpSound(isGood: boolean): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      if (isGood) {
        // 上昇アルペジオ
        const freq1 = 440 * Math.pow(2, t * 2) // C to C
        const freq2 = 554 * Math.pow(2, t * 2) // E to E
        const tone = Math.sin(t * freq1 * Math.PI * 2) + Math.sin(t * freq2 * Math.PI * 2)
        data[i] = tone * Math.exp(-t * 2) * 0.3
      } else {
        // 下降不協和音
        const freq1 = 220 * Math.pow(0.5, t * 2)
        const freq2 = 185 * Math.pow(0.5, t * 2)
        const tone = Math.sin(t * freq1 * Math.PI * 2) + Math.sin(t * freq2 * Math.PI * 2)
        data[i] = tone * Math.exp(-t * 1.5) * 0.3
      }
    }

    return buffer
  }

  // ダメージ音生成
  private generateDamageSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 刺激的な高周波ノイズ
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 8)
      const tone = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 10)
      data[i] = (noise * 0.7 + tone * 0.3) * 0.4
    }

    return buffer
  }

  // 実績解除音生成
  private generateAchievementSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 1.0
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 勝利ファンファーレ風
      const freq = 440 * (1 + Math.sin(t * 8) * 0.1) // 微妙なビブラート
      const tone = Math.sin(t * freq * Math.PI * 2)
      const harmonics = Math.sin(t * freq * 2 * Math.PI * 2) * 0.3
      data[i] = (tone + harmonics) * Math.exp(-t * 0.8) * 0.4
    }

    return buffer
  }

  // レベルアップ音生成
  private generateLevelUpSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 0.8
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 上昇スケール
      const noteProgression = Math.floor(t * 8) // 8音符
      const freq = 330 * Math.pow(2, noteProgression / 8) // 上昇スケール
      const tone = Math.sin(t * freq * Math.PI * 2)
      data[i] = tone * Math.exp(-t * 1) * 0.3
    }

    return buffer
  }

  // ゲームオーバー音生成
  private generateGameOverSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized')
    
    const duration = 1.5
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 下降する悲しいメロディ
      const freq = 220 * Math.pow(0.5, t * 0.8)
      const tone = Math.sin(t * freq * Math.PI * 2)
      const harmonics = Math.sin(t * freq * 1.5 * Math.PI * 2) * 0.5
      data[i] = (tone + harmonics) * Math.exp(-t * 0.5) * 0.4
    }

    return buffer
  }

  // === 音響再生メソッド ===

  // 効果音再生
  playSound(soundName: string, volume: number = 1.0): void {
    if (!this.initialized || !this.audioContext || !this.effectsGain || this.settings.muted) {
      return
    }

    const buffer = this.audioBuffers.get(soundName)
    if (!buffer) {
      console.warn(`Sound "${soundName}" not found`)
      return
    }

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(this.effectsGain)
      
      source.start()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  // === 便利メソッド ===

  playShootSound(): void { this.playSound('shoot', 0.3) }
  playExplosionSound(): void { this.playSound('explosion', 0.8) }
  playPowerUpGoodSound(): void { this.playSound('powerup_good', 0.6) }
  playPowerUpBadSound(): void { this.playSound('powerup_bad', 0.6) }
  playDamageSound(): void { this.playSound('damage', 0.5) }
  playAchievementSound(): void { this.playSound('achievement', 0.7) }
  playLevelUpSound(): void { this.playSound('levelup', 0.6) }
  playGameOverSound(): void { this.playSound('gameover', 0.8) }

  // === 設定管理 ===

  // 音量設定
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  setEffectsVolume(volume: number): void {
    this.settings.effectsVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume))
    this.updateVolumes()
  }

  // ミュート切り替え
  setMuted(muted: boolean): void {
    this.settings.muted = muted
    this.updateVolumes()
  }

  toggleMute(): boolean {
    this.settings.muted = !this.settings.muted
    this.updateVolumes()
    return this.settings.muted
  }

  // 音量反映
  private updateVolumes(): void {
    if (!this.masterGain || !this.effectsGain || !this.musicGain) return

    const masterVol = this.settings.muted ? 0 : this.settings.masterVolume
    this.masterGain.gain.value = masterVol
    this.effectsGain.gain.value = this.settings.effectsVolume
    this.musicGain.gain.value = this.settings.musicVolume
  }

  // 設定取得
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  // 設定適用
  applySettings(settings: Partial<AudioSettings>): void {
    Object.assign(this.settings, settings)
    this.updateVolumes()
  }

  // 初期化状態確認
  isInitialized(): boolean {
    return this.initialized
  }

  // リソース解放
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.audioBuffers.clear()
    this.loadingPromises.clear()
    this.initialized = false
  }
}