const soundCache: Record<string, string> = {
  'basic-bgm': '/sounds/basic-bgm.mp3',
  'hard-bgm': '/sounds/hard-bgm.mp3',
  'breaking-news': '/sounds/breaking-news.mp3',
  'dice': '/sounds/dice.mp3',
  'moving': '/sounds/moving.mp3',
  'negative': '/sounds/negative.mp3',
  'positive': '/sounds/positive.mp3',
  'share-gain': '/sounds/share-gain.mp3',
  'share-pay': '/sounds/share-pay.mp3',
  'turn-start': '/sounds/turn-start.mp3',
};

let bgmAudio: HTMLAudioElement | null = null;

export function playSound(name: keyof typeof soundCache, volume = 1) {
  if (typeof window === 'undefined') return;
  const src = soundCache[name];
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = volume;
  void audio.play().catch(() => {
    // Ignore autoplay errors
  });
}

export function playBgm(name: 'basic-bgm' | 'hard-bgm', volume = 0.4) {
  if (typeof window === 'undefined') return;
  const src = soundCache[name];
  if (!src) return;
  if (!bgmAudio) {
    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
  }
  if (bgmAudio.src !== new URL(src, window.location.origin).href) {
    bgmAudio.src = src;
  }
  bgmAudio.volume = volume;
  void bgmAudio.play().catch(() => {
    // Autoplay may fail; user gesture will start later
  });
}

export function stopBgm() {
  if (!bgmAudio) return;
  bgmAudio.pause();
  bgmAudio.currentTime = 0;
}
