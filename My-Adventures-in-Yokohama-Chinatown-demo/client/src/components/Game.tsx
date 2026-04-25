// ============================================================
// 横浜中華街アドベンチャー - Main Game Component
// Design: Chinese Festival Pop
// ============================================================
import { useEffect, useRef, useCallback, useState } from "react";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GameState,
  GameWorld,
  InputState,
  createWorld,
} from "@/lib/gameEngine";
import { renderGame } from "@/lib/gameRenderer";
import { updateGame } from "@/lib/gameLogic";
import { ALL_STAGES } from "@/lib/stages";
import { createAudioManager, AudioManager } from "@/lib/audioManager";

// Background image URLs
const BG_IMAGES: Record<string, string> = {
  bg_day: "https://d2xsxph8kpxj0f.cloudfront.net/310519663575804788/ZV28VfKy8YTUA5fBvwqLP6/chinatown-bg-day-dGArPque3xrMstwfatTv2X.webp",
  bg_night: "https://d2xsxph8kpxj0f.cloudfront.net/310519663575804788/ZV28VfKy8YTUA5fBvwqLP6/chinatown-bg-night-c5TDhbJvNxsfw2KuNVcjN9.webp",
  bg_harbor: "https://d2xsxph8kpxj0f.cloudfront.net/310519663575804788/ZV28VfKy8YTUA5fBvwqLP6/chinatown-bg-harbor-2nnPQ3GaXahAUtvdKb6iig.webp",
  title: "https://d2xsxph8kpxj0f.cloudfront.net/310519663575804788/ZV28VfKy8YTUA5fBvwqLP6/game-title-screen-aKzzgccGyFURhXntVShFrd.webp",
};

const STAGE_NAMES = ["中華街大通り", "横浜港", "関帝廟の境内", "ドラゴン商会の親分"];
const STAGE_SUBTITLES = ["CHINATOWN BLVD", "YOKOHAMA PORT", "KUAN TI MIAO", "BOSS DRAGON"];

function loadImages(urls: Record<string, string>): Promise<Map<string, HTMLImageElement>> {
  const map = new Map<string, HTMLImageElement>();
  const promises = Object.entries(urls).map(([key, url]) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => { map.set(key, img); resolve(); };
      img.onerror = () => resolve();
      img.src = url;
    });
  });
  return Promise.all(promises).then(() => map);
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>("title");
  const worldRef = useRef<GameWorld | null>(null);
  const inputRef = useRef<InputState>({ left: false, right: false, jump: false, jumpPressed: false });
  const bgImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animFrameRef = useRef<number>(0);
  const currentStageRef = useRef<number>(0);
  const totalScoreRef = useRef<number>(0);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const [uiState, setUiState] = useState<GameState>("title");
  const [stageScore, setStageScore] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [mobileControls, setMobileControls] = useState(false);

  // Initialize audio manager
  useEffect(() => {
    audioManagerRef.current = createAudioManager();
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setMobileControls(isMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load images
  useEffect(() => {
    loadImages(BG_IMAGES).then(map => {
      bgImagesRef.current = map;
      setImagesLoaded(true);
    });
  }, []);

  const startStage = useCallback((stageIndex: number) => {
    const stage = ALL_STAGES[stageIndex];
    if (!stage) return;
    worldRef.current = createWorld(stage);
    worldRef.current.score = totalScoreRef.current;
    worldRef.current.audioManager = audioManagerRef.current;
    currentStageRef.current = stageIndex;
    gameStateRef.current = "playing";
    setUiState("playing");
    
    // Play stage BGM
    if (audioManagerRef.current) {
      const bgmUrls = [
        "/manus-storage/bgm-stage1_320dd356.wav",
        "/manus-storage/bgm-stage2_ce3f33e8.wav",
        "/manus-storage/bgm-stage3_4fa73146.wav",
        "/manus-storage/bgm-stage3_4fa73146.wav", // Boss uses stage 3 BGM
      ];
      audioManagerRef.current.playBgm(bgmUrls[stageIndex] || bgmUrls[0]);
    }
  }, []);

  const startGame = useCallback(() => {
    totalScoreRef.current = 0;
    currentStageRef.current = 0;
    startStage(0);
  }, [startStage]);

  const nextStage = useCallback(() => {
    const next = currentStageRef.current + 1;
    if (next >= ALL_STAGES.length) {
      gameStateRef.current = "gameclear";
      setUiState("gameclear");
    } else {
      totalScoreRef.current = worldRef.current?.score ?? 0;
      startStage(next);
    }
  }, [startStage]);

  const restartGame = useCallback(() => {
    totalScoreRef.current = 0;
    startStage(currentStageRef.current);
  }, [startStage]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const inp = inputRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") inp.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") inp.right = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        if (!inp.jump) {
          inp.jumpPressed = true;
        }
        inp.jump = true;
      }
      if (e.code === "Escape") {
        if (gameStateRef.current === "playing") {
          gameStateRef.current = "paused";
          setUiState("paused");
        } else if (gameStateRef.current === "paused") {
          gameStateRef.current = "playing";
          setUiState("playing");
        }
      }
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const inp = inputRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") inp.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") inp.right = false;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") inp.jump = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let lastTime = 0;

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const state = gameStateRef.current;
      const world = worldRef.current;

      if (state === "playing" && world) {
        // Reset single-frame inputs
        const inp = inputRef.current;

        const result = updateGame(world, inp);

        // Reset jump pressed after processing
        inp.jumpPressed = false;

        if (result.newState === "gameover") {
          gameStateRef.current = "gameover";
          setUiState("gameover");
        } else if (result.newState === "stageclear") {
          gameStateRef.current = "stageclear";
          setStageScore(world.score);
          setTimeBonus(result.scoreBonus ?? 0);
          setUiState("stageclear");
        }

        renderGame(ctx, world, bgImagesRef.current);
      } else if (state === "title") {
        drawTitleScreen(ctx, bgImagesRef.current, timestamp);
      } else if (state === "paused" && world) {
        renderGame(ctx, world, bgImagesRef.current);
        drawPauseOverlay(ctx);
      } else if (state === "gameover" && world) {
        renderGame(ctx, world, bgImagesRef.current);
        // gameover overlay drawn in React UI
      } else if (state === "stageclear" && world) {
        renderGame(ctx, world, bgImagesRef.current);
      } else if (state === "gameclear") {
        drawGameClearScreen(ctx, bgImagesRef.current, timestamp);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [imagesLoaded]);

  // Mobile control handlers
  const setMobileInput = (key: keyof InputState, val: boolean) => {
    const inp = inputRef.current;
    if (key === "jump" && val && !inp.jump) {
      inp.jumpPressed = true;
    }
    (inp as any)[key] = val;
  };

  return (
    <div className="game-wrapper">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />

        {/* Loading screen */}
        {!imagesLoaded && (
          <div className="overlay" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <div style={{ textAlign: 'center', color: '#ffd700', fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}>
              <div style={{ marginBottom: '1rem' }}>読み込み中...</div>
              <div style={{ color: '#ffaa44', fontSize: '0.6rem' }}>LOADING...</div>
            </div>
          </div>
        )}

        {/* Title screen UI */}
        {uiState === "title" && (
          <div className="overlay title-overlay">
            <button className="btn-start" onClick={startGame}>
              ゲームスタート
            </button>
            <div className="controls-hint">
              <span>← → / A D : 移動</span>
              <span>スペース / W / ↑ : ジャンプ（2段）</span>
              <span>ESC : ポーズ</span>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {uiState === "paused" && (
          <div className="overlay pause-overlay">
            <div className="overlay-box">
              <h2 className="overlay-title">⏸ ポーズ</h2>
              <button className="btn-action" onClick={() => {
                gameStateRef.current = "playing";
                setUiState("playing");
              }}>再開</button>
              <button className="btn-action btn-secondary" onClick={() => {
                gameStateRef.current = "title";
                setUiState("title");
              }}>タイトルへ</button>
            </div>
          </div>
        )}

        {/* Game Over overlay */}
        {uiState === "gameover" && (
          <div className="overlay gameover-overlay">
            <div className="overlay-box">
              <h2 className="overlay-title gameover-text">GAME OVER</h2>
              <p className="overlay-sub">ステージ {currentStageRef.current + 1}: {STAGE_NAMES[currentStageRef.current]}</p>
              <p className="overlay-score">スコア: {worldRef.current?.score.toString().padStart(7, "0")}</p>
              <button className="btn-action" onClick={restartGame}>もう一度</button>
              <button className="btn-action btn-secondary" onClick={() => {
                gameStateRef.current = "title";
                setUiState("title");
              }}>タイトルへ</button>
            </div>
          </div>
        )}

        {/* Stage Clear overlay */}
        {uiState === "stageclear" && (
          <div className="overlay stageclear-overlay">
            <div className="overlay-box">
              <h2 className="overlay-title stageclear-text">ステージクリア！</h2>
              <p className="overlay-sub">🎉 {STAGE_NAMES[currentStageRef.current]}</p>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.55rem', color: '#888888', margin: 0 }}>{STAGE_SUBTITLES[currentStageRef.current]}</p>
              <p className="overlay-score">スコア: {stageScore.toString().padStart(7, "0")}</p>
              <p className="overlay-bonus">タイムボーナス: +{timeBonus}</p>
              {currentStageRef.current === 3 && (
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem', color: '#ffdd00', margin: '0.5rem 0 0 0' }}>🐉 ボス撃破！ 🐉</p>
              )}
              {currentStageRef.current + 1 < ALL_STAGES.length ? (
                <button className="btn-action" onClick={nextStage}>
                  次のステージへ →
                </button>
              ) : (
                <button className="btn-action" onClick={nextStage}>
                  エンディングへ ✨
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Clear overlay */}
        {uiState === "gameclear" && (
          <div className="overlay gameclear-overlay">
            <div className="overlay-box gameclear-box">
              <h2 className="overlay-title gameclear-text">🐉 ゲームクリア！ 🐉</h2>
              <p className="overlay-sub">横浜中華街を救った！</p>
              <p className="overlay-score">最終スコア: {(worldRef.current?.score ?? 0).toString().padStart(7, "0")}</p>
              <button className="btn-action" onClick={() => {
                gameStateRef.current = "title";
                setUiState("title");
              }}>タイトルへ戻る</button>
            </div>
          </div>
        )}

        {/* Mobile controls */}
        {mobileControls && uiState === "playing" && (
          <div className="mobile-controls">
            <div className="mobile-dpad">
              <button
                className="mobile-btn mobile-left"
                onTouchStart={() => setMobileInput("left", true)}
                onTouchEnd={() => setMobileInput("left", false)}
                onMouseDown={() => setMobileInput("left", true)}
                onMouseUp={() => setMobileInput("left", false)}
              >◀</button>
              <button
                className="mobile-btn mobile-right"
                onTouchStart={() => setMobileInput("right", true)}
                onTouchEnd={() => setMobileInput("right", false)}
                onMouseDown={() => setMobileInput("right", true)}
                onMouseUp={() => setMobileInput("right", false)}
              >▶</button>
            </div>
            <button
              className="mobile-btn mobile-jump"
              onTouchStart={() => setMobileInput("jump", true)}
              onTouchEnd={() => setMobileInput("jump", false)}
              onMouseDown={() => setMobileInput("jump", true)}
              onMouseUp={() => setMobileInput("jump", false)}
            >JUMP</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Canvas drawing for title / game clear screens ----
function drawTitleScreen(
  ctx: CanvasRenderingContext2D,
  bgImages: Map<string, HTMLImageElement>,
  timestamp: number
) {
  const img = bgImages.get("title");
  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#0a0020");
    grad.addColorStop(1, "#3a0000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Animated lanterns
  const t = timestamp * 0.001;
  for (let i = 0; i < 8; i++) {
    const lx = 60 + i * 100 + Math.sin(t + i) * 8;
    const ly = 30 + Math.sin(t * 0.7 + i * 0.5) * 6;
    ctx.save();
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.ellipse(lx, ly, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawPauseOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawGameClearScreen(
  ctx: CanvasRenderingContext2D,
  bgImages: Map<string, HTMLImageElement>,
  timestamp: number
) {
  const img = bgImages.get("bg_night");
  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Fireworks
  const t = timestamp * 0.001;
  for (let i = 0; i < 5; i++) {
    const fx = 100 + i * 150 + Math.sin(t * 0.3 + i) * 30;
    const fy = 80 + Math.cos(t * 0.4 + i) * 40;
    const colors = ["#ff4400", "#ffd700", "#ff00ff", "#00ffff", "#ffffff"];
    ctx.save();
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 20;
    for (let j = 0; j < 12; j++) {
      const angle = (j / 12) * Math.PI * 2 + t;
      const r = 20 + Math.sin(t * 2 + i) * 10;
      ctx.fillStyle = colors[(i + j) % colors.length];
      ctx.fillRect(
        Math.round(fx + Math.cos(angle) * r - 2),
        Math.round(fy + Math.sin(angle) * r - 2),
        4, 4
      );
    }
    ctx.restore();
  }
}
