// ============================================================
// Audio Manager - BGM & SFX System
// ============================================================

export interface AudioManager {
  bgmVolume: number;
  sfxVolume: number;
  currentBgm: HTMLAudioElement | null;
  sfxElements: Map<string, HTMLAudioElement>;
  playBgm(url: string, loop?: boolean): void;
  stopBgm(): void;
  playSfx(key: string, url: string): void;
  setBgmVolume(volume: number): void;
  setSfxVolume(volume: number): void;
}

export function createAudioManager(): AudioManager {
  const sfxElements = new Map<string, HTMLAudioElement>();
  let currentBgm: HTMLAudioElement | null = null;
  let bgmVolume = 0.6;
  let sfxVolume = 0.7;

  // Preload SFX
  const preloadSfx = (key: string, url: string) => {
    if (!sfxElements.has(key)) {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = sfxVolume;
      sfxElements.set(key, audio);
    }
  };

  return {
    bgmVolume,
    sfxVolume,
    currentBgm,
    sfxElements,

    playBgm(url: string, loop = true) {
      // Stop current BGM
      if (this.currentBgm) {
        this.currentBgm.pause();
        this.currentBgm.currentTime = 0;
      }

      // Create new BGM element
      const bgm = new Audio(url);
      bgm.loop = loop;
      bgm.volume = this.bgmVolume;
      bgm.play().catch(() => {
        // Autoplay may be blocked by browser
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
    },

    playSfx(key: string, url: string) {
      let audio = sfxElements.get(key);

      if (!audio) {
        // Create new SFX element if not cached
        audio = new Audio(url);
        audio.volume = this.sfxVolume;
        sfxElements.set(key, audio);
      }

      // Clone and play (allows overlapping sounds)
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = this.sfxVolume;
      clone.play().catch(() => {
        // SFX may fail to play in some contexts
      });
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
