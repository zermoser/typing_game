import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

interface WordItem {
  word: string;
  translation: string;
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
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [theme, setTheme] = useState<Theme>('day');
  const [spawnRate, setSpawnRate] = useState<number>(2000);
  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [balloons, setBalloons] = useState<BalloonData[]>([]);
  const [input, setInput] = useState<string>('');
  const [life, setLife] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const balloonId = useRef<number>(0);
  const gameOver = life <= 0;

  // Fetch words from external API
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch words');
        const data: WordItem[] = await res.json();
        setWordPool(data);
      } catch {
        setWordPool([
          { word: 'cat', translation: 'แมว' },
          { word: 'dog', translation: 'หมา' },
          { word: 'sun', translation: 'ดวงอาทิตย์' },
          { word: 'apple', translation: 'แอปเปิ้ล' },
          { word: 'banana', translation: 'กล้วย' },
          { word: 'orange', translation: 'ส้ม' },
          { word: 'elephant', translation: 'ช้าง' },
          { word: 'pineapple', translation: 'สับปะรด' },
          { word: 'umbrella', translation: 'ร่ม' },
        ]);
      }
    };
    fetchWords();
  }, []);

  // Adjust spawnRate based on difficulty
  useEffect(() => {
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

  // Spawn balloons at interval
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      spawnBalloon();
    }, spawnRate);
    return () => {
      clearInterval(interval);
    };
  }, [spawnRate, gameOver, wordPool]);

  // Update balloon positions every 50ms
  useEffect(() => {
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
    return () => {
      clearInterval(timer);
    };
  }, [balloons]);

  const spawnBalloon = (): void => {
    if (wordPool.length === 0) return;
    const filtered =
      difficulty === 'Easy'
        ? wordPool.filter((w) => w.word.length <= 4)
        : difficulty === 'Normal'
        ? wordPool.filter((w) => w.word.length <= 6)
        : wordPool;
    if (filtered.length === 0) return;
    const wordObj = filtered[Math.floor(Math.random() * filtered.length)];
    const newBalloon: BalloonData = {
      id: balloonId.current++,
      word: wordObj.word,
      translation: wordObj.translation,
      x: Math.random() * 80 + 10,
      fallHeight: 100,
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  const loseLife = (): void => {
    setLife((l) => l - 1);
    setCombo(0);
    // TODO: เล่นเสียงเสียพลังชีวิต
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
    const trimmed = e.target.value.trim();
    const matched = balloons.find((b) => b.word === trimmed);
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

  return (
    <div
      className={`${
        theme === 'night'
          ? 'bg-gradient-to-b from-gray-900 to-black text-white'
          : 'bg-gradient-to-b from-blue-100 to-white text-gray-800'
      } min-h-screen transition-colors duration-500`}
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Typing Balloon</h1>
        <div className="flex items-center space-x-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="border rounded-lg p-2 bg-white text-sm focus:outline-none"
          >
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
          </select>
          <button
            onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
            className="border rounded-lg p-2 bg-white text-sm focus:outline-none"
          >
            {theme === 'day' ? '🌙 Night' : '☀️ Day'}
          </button>
        </div>
      </header>

      {/* Score & Life */}
      <div className="flex justify-between items-center max-w-4xl mx-auto px-6">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">Score: </span>
          <span className="text-xl font-bold">{score}</span>
        </div>
        <div className="flex items-center space-x-2">
          {Array.from({ length: life }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className="text-2xl animate-pulse text-red-500">
              ❤️
            </span>
          ))}
        </div>
        <div>
          <span className="text-lg font-medium">Combo: </span>
          <span className="text-xl font-bold text-indigo-600">{combo}</span>
        </div>
      </div>

      {/* Game Area */}
      <main className="relative h-[60vh] max-w-4xl mx-auto my-8 border-2 border-indigo-300 rounded-xl overflow-hidden bg-white shadow-xl">
        {balloons.map((b) => (
          <div
            key={b.id}
            style={{ left: `${b.x}%`, bottom: `${b.fallHeight}%` }}
            className="absolute bg-gradient-to-br from-pink-400 to-red-500 rounded-full px-4 py-2 text-white font-semibold shadow-lg drop-shadow-lg animate-bounce-slow"
          >
            {b.word}
          </div>
        ))}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-4xl font-extrabold text-white">
            Game Over
          </div>
        )}
      </main>

      {/* Input Field */}
      {!gameOver && (
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            className={`w-full border-2 rounded-xl p-4 text-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
              theme === 'night' ? 'text-black bg-gray-200' : 'text-gray-800 bg-white'
            }`}
            placeholder="Type the word here..."
            autoFocus
          />
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 Kittipoj Naewthavorn.
      </footer>
    </div>
  );
};

export default App;
