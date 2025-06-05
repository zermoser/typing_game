import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

interface WordItem {
  word: string;
  translation: string;
  category: 'Animals' | 'Fruits' | 'Objects';
}

interface BalloonData {
  id: number;
  word: string;
  translation: string;
  x: number;
  fallHeight: number;
}

type Difficulty = 'Easy' | 'Normal' | 'Hard';
type Theme = 'day' | 'night';

const API_URL = 'https://your-domain.com/words.json'; // เปลี่ยนเป็น endpoint จริง

const App: React.FC = () => {
  // ─── Game State ───────────────────────────────────────────────────────────────
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [category, setCategory] = useState<'Animals' | 'Fruits' | 'Objects' | null>(null);
  const [theme, setTheme] = useState<Theme>('day');
  const [spawnRate, setSpawnRate] = useState<number>(2000);
  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [filteredPool, setFilteredPool] = useState<WordItem[]>([]);
  const [balloons, setBalloons] = useState<BalloonData[]>([]);
  const [input, setInput] = useState<string>('');
  const [life, setLife] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);

  // New state: which “start” sub‐page the user is on (1 = choose category, 2 = choose difficulty)
  const [startStep, setStartStep] = useState<1 | 2>(1);

  const balloonId = useRef<number>(0);
  const gameOver = gameStarted && life <= 0;

  // ─── Fetch Word List ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch words');
        const data: WordItem[] = await res.json();
        setWordPool(data);
      } catch {
        // Fallback word list พร้อมหมวดหมู่
        setWordPool([
          { word: 'cat', translation: 'แมว', category: 'Animals' },
          { word: 'dog', translation: 'หมา', category: 'Animals' },
          { word: 'elephant', translation: 'ช้าง', category: 'Animals' },
          { word: 'apple', translation: 'แอปเปิ้ล', category: 'Fruits' },
          { word: 'banana', translation: 'กล้วย', category: 'Fruits' },
          { word: 'orange', translation: 'ส้ม', category: 'Fruits' },
          { word: 'pineapple', translation: 'สับปะรด', category: 'Fruits' },
          { word: 'sun', translation: 'ดวงอาทิตย์', category: 'Objects' },
          { word: 'umbrella', translation: 'ร่ม', category: 'Objects' },
        ]);
      }
    };
    fetchWords();
  }, []);

  // ─── กำหนด filteredPool จากคำในหมวดหมู่ที่เลือก ─────────────────────────────
  useEffect(() => {
    if (!category) {
      setFilteredPool([]);
      return;
    }
    const pool = wordPool.filter((w) => w.category === category);
    setFilteredPool(pool);
  }, [category, wordPool]);

  // ─── Adjust spawnRate Based on Difficulty ────────────────────────────────────
  useEffect(() => {
    if (!difficulty) return;
    let rate: number;
    if (difficulty === 'Easy') {
      rate = 3000;
    } else if (difficulty === 'Normal') {
      rate = 2000;
    } else {
      rate = 1200;
    }
    setSpawnRate(rate);
  }, [difficulty]);

  // ─── Spawn Balloons at an Interval ────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      spawnBalloon();
    }, spawnRate);
    return () => clearInterval(interval);
  }, [spawnRate, gameStarted, gameOver, filteredPool]);

  // ─── Update Balloon Positions Every 50ms ──────────────────────────────────────
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      setBalloons((prev) =>
        prev
          .filter((b) => {
            if (b.fallHeight <= 0) {
              loseLife();
              return false;
            }
            return true;
          })
          .map((b) => ({ ...b, fallHeight: b.fallHeight - 1 }))
      );
    }, 50);
    return () => clearInterval(timer);
  }, [gameStarted, balloons]);

  // ─── Spawn a Single Balloon ───────────────────────────────────────────────────
  const spawnBalloon = (): void => {
    if (!difficulty || filteredPool.length === 0) return;
    const filteredByDifficulty =
      difficulty === 'Easy'
        ? filteredPool.filter((w) => w.word.length <= 4)
        : difficulty === 'Normal'
        ? filteredPool.filter((w) => w.word.length <= 6)
        : filteredPool;

    if (filteredByDifficulty.length === 0) return;
    const wordObj = filteredByDifficulty[Math.floor(Math.random() * filteredByDifficulty.length)];
    const newBalloon: BalloonData = {
      id: balloonId.current++,
      word: wordObj.word,
      translation: wordObj.translation,
      x: Math.random() * 80 + 10, // Random horizontal between 10%–90%
      fallHeight: 100, // starts at top (100%)
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  // ─── Handle Losing a Life ──────────────────────────────────────────────────────
  const loseLife = (): void => {
    setLife((l) => l - 1);
    setCombo(0);
    // TODO: เล่นเสียงเสียพลังชีวิต
  };

  // ─── Handle Input Change (Typing) ──────────────────────────────────────────────
  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
    const trimmed = e.target.value.trim().toLowerCase();
    const matched = balloons.find((b) => b.word.toLowerCase() === trimmed);
    if (matched) {
      setBalloons((prev) => prev.filter((b) => b.id !== matched.id));
      setInput('');
      setScore((s) => s + 10 + combo * 2);
      setCombo((c) => c + 1);
      // TODO: เล่นเสียงยิงโดนบอลลูน
      // eslint-disable-next-line no-alert
      alert(`คำแปล: ${matched.translation}`);
    }
  };

  // ─── Start Game (Reset State) ─────────────────────────────────────────────────
  const startGame = () => {
    if (!difficulty || !category) return;
    balloonId.current = 0;
    setBalloons([]);
    setInput('');
    setLife(3);
    setScore(0);
    setCombo(0);
    setGameStarted(true);
  };

  // ─── Restart Game (Same Difficulty/Category) ─────────────────────────────────
  const restartGame = () => {
    balloonId.current = 0;
    setBalloons([]);
    setInput('');
    setLife(3);
    setScore(0);
    setCombo(0);
  };

  // ─── Back to Main Menu (Reset Everything) ────────────────────────────────────
  const goToMainMenu = () => {
    balloonId.current = 0;
    setBalloons([]);
    setInput('');
    setLife(3);
    setScore(0);
    setCombo(0);
    setDifficulty(null);
    setCategory(null);
    setGameStarted(false);
    setStartStep(1); // กลับไปหน้าเลือกหมวดหมู่ก่อน
  };

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`${theme === 'night' ? 'bg-black text-white' : 'bg-white text-gray-900'} min-h-screen flex flex-col transition-colors duration-500`}
    >
      {/* ─── Header (Title + Theme Toggle) ───────────────────────────────────────── */}
      <header
        className={`flex justify-between items-center px-6 py-4 text-white ${
          theme === 'night' ? 'bg-gray-900' : 'bg-indigo-600'
        }`}
      >
        <h1 className="text-3xl font-extrabold">Typing Balloon</h1>
        <button
          onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
          className={`p-3 rounded-full border-2 ${
            theme === 'night' ? 'border-gray-300 bg-gray-700' : 'border-white bg-indigo-500'
          } shadow-lg hover:opacity-90 transition`}
        >
          {theme === 'day' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* ─── Start Screen (Split into Two Sub‐Pages) ─────────────────────────────── */}
      {!gameStarted && (
        <main className="flex-grow flex flex-col justify-center items-center px-6">
          {/* Container */}
          <div className={`w-full max-w-xl ${theme === 'night' ? 'bg-gray-800' : 'bg-indigo-50'} rounded-3xl p-8 shadow-2xl`}>
            {startStep === 1 && (
              <>
                {/* STEP 1: Choose Category */}
                <h2 className={`text-2xl font-semibold text-center mb-6 ${theme === 'night' ? 'text-white' : 'text-indigo-800'}`}>
                  เลือกหมวดหมู่คำศัพท์
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {/* Card: Animals */}
                  <div
                    onClick={() => setCategory('Animals')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${
                        category === 'Animals'
                          ? theme === 'night'
                            ? 'bg-yellow-500 ring-4 ring-indigo-400 text-white'
                            : 'bg-indigo-600 ring-4 ring-white text-white'
                          : theme === 'night'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-indigo-800'
                      }
                      shadow-lg
                    `}
                  >
                    <span className="text-5xl mb-3">{/* เลือกไอคอนตามหมวด */}🐾</span>
                    <h3 className="text-xl font-semibold mb-1">Animals</h3>
                    <p className="text-sm opacity-80">คำศัพท์เกี่ยวกับสัตว์</p>
                  </div>

                  {/* Card: Fruits */}
                  <div
                    onClick={() => setCategory('Fruits')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${
                        category === 'Fruits'
                          ? theme === 'night'
                            ? 'bg-yellow-500 ring-4 ring-indigo-400 text-white'
                            : 'bg-indigo-600 ring-4 ring-white text-white'
                          : theme === 'night'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-indigo-800'
                      }
                      shadow-lg
                    `}
                  >
                    <span className="text-5xl mb-3">🍎</span>
                    <h3 className="text-xl font-semibold mb-1">Fruits</h3>
                    <p className="text-sm opacity-80">คำศัพท์เกี่ยวกับผลไม้</p>
                  </div>

                  {/* Card: Objects */}
                  <div
                    onClick={() => setCategory('Objects')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${
                        category === 'Objects'
                          ? theme === 'night'
                            ? 'bg-yellow-500 ring-4 ring-indigo-400 text-white'
                            : 'bg-indigo-600 ring-4 ring-white text-white'
                          : theme === 'night'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-indigo-800'
                      }
                      shadow-lg
                    `}
                  >
                    <span className="text-5xl mb-3">📦</span>
                    <h3 className="text-xl font-semibold mb-1">Objects</h3>
                    <p className="text-sm opacity-80">คำศัพท์เกี่ยวกับสิ่งของ</p>
                  </div>
                </div>

                <button
                  onClick={() => setStartStep(2)}
                  disabled={!category}
                  className={`mt-10 w-full py-4 rounded-full text-xl font-semibold transition ${
                    category
                      ? theme === 'night'
                        ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  } shadow-xl`}
                >
                  Next
                </button>
              </>
            )}

            {startStep === 2 && (
              <>
                {/* STEP 2: Choose Difficulty */}
                <h2 className={`text-2xl font-semibold text-center mb-6 ${theme === 'night' ? 'text-white' : 'text-indigo-800'}`}>
                  เลือกระดับความยาก
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {(['Easy', 'Normal', 'Hard'] as const).map((diff) => (
                    <div
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`
                        cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                        transition-transform transform hover:scale-105 duration-200
                        ${
                          difficulty === diff
                            ? theme === 'night'
                              ? 'bg-yellow-500 ring-4 ring-indigo-400 text-white'
                              : 'bg-indigo-600 ring-4 ring-white text-white'
                            : theme === 'night'
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-white text-indigo-800'
                        }
                        shadow-lg
                      `}
                    >
                      <span className="text-5xl mb-3">
                        {diff === 'Easy' ? '🐤' : diff === 'Normal' ? '🌤️' : '🦾'}
                      </span>
                      <h3 className="text-xl font-semibold mb-1">{diff}</h3>
                      <p className="text-sm opacity-80">
                        {diff === 'Easy'
                          ? 'Spawn ช้า (3 วิ) คำสั้น (≤4 ตัว)'
                          : diff === 'Normal'
                          ? 'Spawn ปานกลาง (2 วิ) คำกลาง (≤6 ตัว)'
                          : 'Spawn เร็ว (1.2 วิ) คำยาว (ไม่จำกัด)'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStartStep(1)}
                    className={`flex-1 py-4 rounded-full text-xl font-semibold transition ${
                      theme === 'night' ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    } shadow-xl`}
                  >
                    Back
                  </button>
                  <button
                    onClick={startGame}
                    disabled={!difficulty}
                    className={`flex-1 py-4 rounded-full text-xl font-semibold transition ${
                      difficulty
                        ? theme === 'night'
                          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    } shadow-xl`}
                  >
                    Start Game
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      )}

      {/* ─── Game Area (While Playing) ─────────────────────────────────────────────── */}
      {gameStarted && !gameOver && (
        <>
          {/* Score / Life / Combo */}
          <div className={`flex justify-between items-center px-6 py-3 ${theme === 'night' ? 'bg-gray-800' : 'bg-indigo-100'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-lg font-medium">Score:</span>
              <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: life }).map((_, i) => (
                <span key={i} className="text-2xl animate-pulse text-red-500">
                  ❤️
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-lg font-medium">Combo:</span>
              <span className="text-2xl font-bold text-indigo-600">{combo}</span>
            </div>
          </div>

          {/* Balloons Falling */}
          <main
            className={`relative flex-grow mx-6 my-4 border-2 rounded-2xl overflow-hidden shadow-xl ${
              theme === 'night' ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {balloons.map((b) => (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, bottom: `${b.fallHeight}%` }}
                className="absolute bg-gradient-to-br from-pink-500 to-red-600 rounded-full px-4 py-2 text-base text-white font-semibold shadow-lg animate-bounce-slow whitespace-nowrap"
              >
                {b.word}
              </div>
            ))}
          </main>

          {/* Input Field */}
          <div className="px-6 mb-6">
            <input
              type="text"
              value={input}
              onChange={handleInput}
              className={`w-full border-2 rounded-full py-4 px-6 text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition ${
                theme === 'night'
                  ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 border-gray-300 placeholder-gray-500'
              }`}
              placeholder="Type the word here..."
              autoFocus
            />
          </div>
        </>
      )}

      {/* ─── Game Over Overlay ────────────────────────────────────────────────────── */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center px-6">
          <h2 className="text-5xl font-extrabold text-white mb-4">Game Over</h2>
          <p className="text-white text-2xl mb-8">
            คะแนนสุดท้าย: <span className="font-bold">{score}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <button
              onClick={restartGame}
              className="w-full py-6 rounded-full bg-indigo-600 text-white text-2xl font-semibold shadow-lg hover:bg-indigo-700 transition"
            >
              Restart
            </button>
            <button
              onClick={goToMainMenu}
              className="w-full py-6 rounded-full bg-gray-200 text-gray-800 text-2xl font-semibold shadow-lg hover:bg-gray-300 transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* ─── Footer ───────────────────────────────────────────────────────────────── */}
      <footer
        className={`text-center py-4 text-sm font-medium ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'}`}
      >
        © 2025 Kittipoj Naewthavorn.
      </footer>
    </div>
  );
};

export default App;
