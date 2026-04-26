export interface AudioManager {
  bgmVolume: number;
  sfxVolume: number;
  currentBgm: HTMLAudioElement | null;
  sfxElements: Map<string, HTMLAudioElement>;
  unlocked: boolean;
  pendingBgmUrl: string | null;
  pendingBgmLoop: boolean;
  unlock(): void;
  playBgm(url: string, loop?: boolean): void;
  stopBgm(): void;
  playSfx(key: string, url: string): void;
  setBgmVolume(volume: number): void;
  setSfxVolume(volume: number): void;
}

export function createAudioManager(): AudioManager {
  const sfxElements = new Map<string, HTMLAudioElement>();

  return {
    bgmVolume: 0.6,
    sfxVolume: 0.7,
    currentBgm: null,
    sfxElements,
    unlocked: false,
    pendingBgmUrl: null,
    pendingBgmLoop: true,

    unlock() {
      this.unlocked = true;

      if (this.pendingBgmUrl) {
        const url = this.pendingBgmUrl;
        const loop = this.pendingBgmLoop;
        this.pendingBgmUrl = null;
        this.playBgm(url, loop);
      }
    },

    playBgm(url: string, loop = true) {
      if (this.currentBgm) {
        this.currentBgm.pause();
        this.currentBgm.currentTime = 0;
      }

      const bgm = new Audio(url);
      bgm.loop = loop;
      bgm.volume = this.bgmVolume;

      // 最初のユーザー操作前は再生しない
      if (!this.unlocked) {
        this.pendingBgmUrl = url;
        this.pendingBgmLoop = loop;
        this.currentBgm = bgm;
        return;
      }

      bgm.play().catch(() => {
        console.warn("BGM autoplay blocked");
      });

      this.currentBgm = bgm;
    },

    stopBgm() {
      if (this.currentBgm) {
        this.currentBgm.pause();
        this.currentBgm.currentTime = 0;
        this.currentBgm = null;
      }
      this.pendingBgmUrl = null;
    },

    playSfx(key: string, url: string) {
      // 最初のユーザー操作前はSFXも鳴らさない
      if (!this.unlocked) return;

      let audio = sfxElements.get(key);

      if (!audio) {
        audio = new Audio(url);
        audio.volume = this.sfxVolume;
        sfxElements.set(key, audio);
      }

      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = this.sfxVolume;
      clone.play().catch(() => {});
    },

    setBgmVolume(volume: number) {
      this.bgmVolume = Math.max(0, Math.min(1, volume));
      if (this.currentBgm) {
        this.currentBgm.volume = this.bgmVolume;
      }
    },

    setSfxVolume(volume: number) {
      this.sfxVolume = Math.max(0, Math.min(1, volume));
      sfxElements.forEach((audio) => {
        audio.volume = this.sfxVolume;
      });
    },
  };
}
