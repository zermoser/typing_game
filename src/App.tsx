import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

interface WordItem {
  word: string;
  translation: string;
}

interface WordsList {
  easy: WordItem[];
  normal: WordItem[];
  hard: WordItem[];
}

interface BalloonData {
  id: number;
  word: string;
  translation: string;
  x: number; // เปอร์เซ็นต์ตำแหน่งแนวนอน
  fallHeight: number; // เปอร์เซ็นต์ตำแหน่งแนวตั้ง (0–100)
}

interface LeaderboardEntry {
  score: number;
  date: string;
}

type Difficulty = 'Easy' | 'Normal' | 'Hard';
type Theme = 'day' | 'night';

// คำศัพท์และคำแปล
const wordsList: WordsList = {
  easy: [
    { word: 'cat', translation: 'แมว' },
    { word: 'dog', translation: 'หมา' },
    { word: 'sun', translation: 'ดวงอาทิตย์' },
  ],
  normal: [
    { word: 'apple', translation: 'แอปเปิ้ล' },
    { word: 'banana', translation: 'กล้วย' },
    { word: 'orange', translation: 'ส้ม' },
  ],
  hard: [
    { word: 'elephant', translation: 'ช้าง' },
    { word: 'pineapple', translation: 'สับปะรด' },
    { word: 'umbrella', translation: 'ร่ม' },
  ],
};

// คอมโพเนนต์ Balloon
const Balloon: React.FC<BalloonData> = ({ x, fallHeight, word }) => (
  <div
    style={{ left: `${x}%`, bottom: `${fallHeight}%` }}
    className="absolute bg-red-400 rounded-full px-4 py-2 text-white"
  >
    {word}
  </div>
);

// คอมโพเนนต์ InputField
interface InputFieldProps {
  input: string;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ input, handleInput }) => (
  <input
    type="text"
    value={input}
    onChange={handleInput}
    className="border p-2 w-full text-xl"
    placeholder="Type here..."
    autoFocus
  />
);

// คอมโพเนนต์ ScoreBoard
interface ScoreBoardProps {
  score: number;
  life: number;
  combo: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, life, combo }) => (
  <div className="flex justify-between mb-2">
    <div>Score: {score}</div>
    <div>Life: {life}</div>
    <div>Combo: {combo}</div>
  </div>
);

// คอมโพเนนต์ Leaderboard
interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => (
  <div className="mt-4">
    <h2 className="text-lg">Leaderboard</h2>
    <ul>
      {leaderboard.map((entry, idx) => (
        <li key={idx}>
          {entry.date}: {entry.score}
        </li>
      ))}
    </ul>
  </div>
);

// คอมโพเนนต์ DifficultySelector
interface DifficultySelectorProps {
  difficulty: Difficulty;
  setDifficulty: React.Dispatch<React.SetStateAction<Difficulty>>;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, setDifficulty }) => (
  <select
    value={difficulty}
    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
    className="border p-2"
  >
    <option>Easy</option>
    <option>Normal</option>
    <option>Hard</option>
  </select>
);

// คอมโพเนนต์ ThemeToggle
interface ThemeToggleProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => (
  <button onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} className="border p-2">
    {theme === 'day' ? 'Switch to Night' : 'Switch to Day'}
  </button>
);

// คอมโพเนนต์หลัก App
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const balloonId = useRef<number>(0);
  const gameOver = life <= 0;

  // ตั้งค่า spawn rate และ word pool ตาม difficulty
  useEffect(() => {
    let rate: number;
    if (difficulty === 'Easy') {
      rate = 3000;
      setWordPool(wordsList.easy);
    } else if (difficulty === 'Normal') {
      rate = 2000;
      setWordPool(wordsList.normal);
    } else {
      rate = 1200;
      setWordPool(wordsList.hard);
    }
    setSpawnRate(rate);
  }, [difficulty]);

  // สร้างบอลลูนใหม่เป็นระยะๆ
  useEffect(() => {
    if (gameOver) {
      return;
    }
    const interval = setInterval(() => {
      spawnBalloon();
    }, spawnRate);

    return () => {
      clearInterval(interval);
    };
  }, [spawnRate, gameOver]);

  // อัปเดตตำแหน่งบอลลูน (ลอยขึ้น) ทุก 50ms
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

  // เก็บ Leaderboard เมื่อเกมจบ
  useEffect(() => {
    if (gameOver) {
      const newEntry: LeaderboardEntry = {
        score,
        date: new Date().toLocaleString('th-TH'),
      };
      const newLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setLeaderboard(newLeaderboard);
      localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard));
    }
  }, [gameOver, leaderboard, score]);

  // โหลด Leaderboard จาก localStorage ตอนเริ่มต้น
  useEffect(() => {
    const stored = localStorage.getItem('leaderboard');
    if (stored) {
      setLeaderboard(JSON.parse(stored) as LeaderboardEntry[]);
    }
  }, []);

  const spawnBalloon = (): void => {
    const wordObj = wordPool[Math.floor(Math.random() * wordPool.length)];
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
        theme === 'night' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
      } min-h-screen p-4`}
    >
      <div className="flex justify-between items-center mb-4">
        <DifficultySelector difficulty={difficulty} setDifficulty={setDifficulty} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <ScoreBoard score={score} life={life} combo={combo} />

      <div className="relative h-96 border my-4 overflow-hidden bg-blue-100">
        {balloons.map((b) => (
          <Balloon
            key={b.id}
            id={b.id}
            x={b.x}
            fallHeight={b.fallHeight}
            word={b.word}
            translation={b.translation}
          />
        ))}

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-2xl">
            Game Over
          </div>
        )}
      </div>

      {!gameOver && <InputField input={input} handleInput={handleInput} />}

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default App;
