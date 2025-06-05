import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

interface WordItem {
  word: string;
  translation: string;
  category: 'Animals' | 'Fruits' | 'Objects' | 'DailyLife' | 'Occupation';
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

const API_URL = 'https://mockup-eiei-for-test.com/words.json'; // เปลี่ยนเป็น endpoint จริง

const App: React.FC = () => {
  // ─── Game State ───────────────────────────────────────────────────────────────
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [category, setCategory] = useState<'Animals' | 'Fruits' | 'Objects' | 'DailyLife' | 'Occupation' | null>(null);
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

  // ─── Fetch Word List (หรือใช้ fallback) ────────────────────────────────────────
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch words');
        const data: WordItem[] = await res.json();
        setWordPool(data);
      } catch {
        // Fallback word list พร้อมหมวดหมู่ 5 หมวด แต่ละหมวด 15 คำ
        setWordPool([
          // ─── Animals: ≤4 ────────────────────────
          { word: 'cat', translation: 'แมว', category: 'Animals' },
          { word: 'dog', translation: 'หมา', category: 'Animals' },
          { word: 'bat', translation: 'ค้างคาว', category: 'Animals' },
          { word: 'ant', translation: 'มด', category: 'Animals' },
          { word: 'bee', translation: 'ผึ้ง', category: 'Animals' },
          { word: 'fox', translation: 'จิ้งจอก', category: 'Animals' },
          { word: 'cow', translation: 'วัว', category: 'Animals' },
          { word: 'owl', translation: 'นกฮูก', category: 'Animals' },
          { word: 'pig', translation: 'หมู', category: 'Animals' },
          { word: 'rat', translation: 'หนู', category: 'Animals' },
          { word: 'eel', translation: 'ปลาไหล', category: 'Animals' },
          { word: 'yak', translation: 'จามรี', category: 'Animals' },
          { word: 'hen', translation: 'ไก่ตัวเมีย', category: 'Animals' },
          { word: 'cub', translation: 'ลูกสัตว์', category: 'Animals' },
          { word: 'doe', translation: 'กวางตัวเมีย', category: 'Animals' },

          // ─── Animals: ≤6 ────────────────────────
          { word: 'zebra', translation: 'ม้าลาย', category: 'Animals' },
          { word: 'tiger', translation: 'เสือ', category: 'Animals' },
          { word: 'koala', translation: 'โคอาลา', category: 'Animals' },
          { word: 'snake', translation: 'งู', category: 'Animals' },
          { word: 'horse', translation: 'ม้า', category: 'Animals' },
          { word: 'mouse', translation: 'เมาส์', category: 'Animals' },
          { word: 'sheep', translation: 'แกะ', category: 'Animals' },
          { word: 'crane', translation: 'นกกระเรียน', category: 'Animals' },
          { word: 'whale', translation: 'ปลาวาฬ', category: 'Animals' },
          { word: 'shrimp', translation: 'กุ้ง', category: 'Animals' },
          { word: 'parrot', translation: 'นกแก้ว', category: 'Animals' },
          { word: 'rabbit', translation: 'กระต่าย', category: 'Animals' },
          { word: 'grouse', translation: 'นกกว้างปีก', category: 'Animals' },
          { word: 'pigeon', translation: 'นกพิราบ', category: 'Animals' },
          { word: 'donkey', translation: 'ลา', category: 'Animals' },

          // ─── Animals: >6 ────────────────────────
          { word: 'elephant', translation: 'ช้าง', category: 'Animals' },
          { word: 'giraffe', translation: 'ยีราฟ', category: 'Animals' },
          { word: 'kangaroo', translation: 'จิงโจ้', category: 'Animals' },
          { word: 'crocodile', translation: 'จระเข้', category: 'Animals' },
          { word: 'alligator', translation: 'อัลลิเกเตอร์', category: 'Animals' },
          { word: 'chimpanzee', translation: 'ชิมแปนซี', category: 'Animals' },
          { word: 'rhinoceros', translation: 'แรด', category: 'Animals' },
          { word: 'butterfly', translation: 'ผีเสื้อ', category: 'Animals' },
          { word: 'woodpecker', translation: 'นกหัวขวาน', category: 'Animals' },
          { word: 'orangutan', translation: 'อุรังอุตัง', category: 'Animals' },
          { word: 'porcupine', translation: 'เม่น', category: 'Animals' },
          { word: 'armadillo', translation: 'อาร์มาดิลโล', category: 'Animals' },
          { word: 'grasshopper', translation: 'ตั๊กแตน', category: 'Animals' },
          { word: 'salamander', translation: 'ซาลาแมนเดอร์', category: 'Animals' },
          { word: 'hedgehog', translation: 'เม่นแคระ', category: 'Animals' },

          // ─── Fruits: ≤4 ──────────────────────────────────────────────
          { word: 'fig', translation: 'มะเดื่อ', category: 'Fruits' },
          { word: 'lime', translation: 'มะนาวเขียว', category: 'Fruits' },
          { word: 'pear', translation: 'ลูกแพร์', category: 'Fruits' },
          { word: 'plum', translation: 'พลัม', category: 'Fruits' },
          { word: 'kiwi', translation: 'กีวี', category: 'Fruits' },
          { word: 'date', translation: 'อินทผาลัม', category: 'Fruits' },
          { word: 'nut', translation: 'ถั่ว', category: 'Fruits' },
          { word: 'melon', translation: 'เมลอน', category: 'Fruits' },
          { word: 'berry', translation: 'เบอร์รี', category: 'Fruits' },
          { word: 'guava', translation: 'ฝรั่ง', category: 'Fruits' },
          { word: 'yuzu', translation: 'ยูซุ', category: 'Fruits' },
          { word: 'olive', translation: 'มะกอก', category: 'Fruits' },
          { word: 'jamun', translation: 'ชมพู่', category: 'Fruits' },
          { word: 'lulo', translation: 'ลูโล', category: 'Fruits' },
          { word: 'ugni', translation: 'อุกนี', category: 'Fruits' },

          // ─── Fruits: ≤6 ──────────────────────────────────────────────
          { word: 'banana', translation: 'กล้วย', category: 'Fruits' },
          { word: 'orange', translation: 'ส้ม', category: 'Fruits' },
          { word: 'mango', translation: 'มะม่วง', category: 'Fruits' },
          { word: 'grape', translation: 'องุ่น', category: 'Fruits' },
          { word: 'lemon', translation: 'มะนาว', category: 'Fruits' },
          { word: 'papaya', translation: 'มะละกอ', category: 'Fruits' },
          { word: 'apple', translation: 'แอปเปิ้ล', category: 'Fruits' },
          { word: 'lychee', translation: 'ลิ้นจี่', category: 'Fruits' },
          { word: 'durian', translation: 'ทุเรียน', category: 'Fruits' },
          { word: 'salak', translation: 'สละ', category: 'Fruits' },
          { word: 'apricot', translation: 'แอปริคอต', category: 'Fruits' },
          { word: 'citrus', translation: 'ซิตรัส', category: 'Fruits' },
          { word: 'tamarind', translation: 'มะขาม', category: 'Fruits' },
          { word: 'mangosteen', translation: 'มังคุด', category: 'Fruits' },
          { word: 'rambai', translation: 'ละมุด', category: 'Fruits' },

          // ─── Fruits: >6 ──────────────────────────────────────────────
          { word: 'pineapple', translation: 'สับปะรด', category: 'Fruits' },
          { word: 'strawberry', translation: 'สตรอว์เบอร์รี', category: 'Fruits' },
          { word: 'watermelon', translation: 'แตงโม', category: 'Fruits' },
          { word: 'blackberry', translation: 'แบล็กเบอร์รี', category: 'Fruits' },
          { word: 'blueberry', translation: 'บลูเบอร์รี', category: 'Fruits' },
          { word: 'raspberry', translation: 'ราสป์เบอร์รี', category: 'Fruits' },
          { word: 'passionfruit', translation: 'เสาวรส', category: 'Fruits' },
          { word: 'dragonfruit', translation: 'แก้วมังกร', category: 'Fruits' },
          { word: 'gooseberry', translation: 'กูสเบอร์รี', category: 'Fruits' },
          { word: 'mulberry', translation: 'หม่อน', category: 'Fruits' },
          { word: 'cranberry', translation: 'แครนเบอร์รี', category: 'Fruits' },
          { word: 'elderberry', translation: 'เอลเดอร์เบอร์รี', category: 'Fruits' },
          { word: 'jackfruit', translation: 'ขนุน', category: 'Fruits' },
          { word: 'persimmon', translation: 'ลูกพลับ', category: 'Fruits' },
          { word: 'longanberry', translation: 'ลำไย', category: 'Fruits' },

          // ─── Objects: ≤4 ─────────────────────────────────────────────
          { word: 'pen', translation: 'ปากกา', category: 'Objects' },
          { word: 'cup', translation: 'ถ้วย', category: 'Objects' },
          { word: 'bag', translation: 'กระเป๋า', category: 'Objects' },
          { word: 'key', translation: 'กุญแจ', category: 'Objects' },
          { word: 'fan', translation: 'พัดลม', category: 'Objects' },
          { word: 'box', translation: 'กล่อง', category: 'Objects' },
          { word: 'hat', translation: 'หมวก', category: 'Objects' },
          { word: 'map', translation: 'แผนที่', category: 'Objects' },
          { word: 'bed', translation: 'เตียง', category: 'Objects' },
          { word: 'rug', translation: 'พรม', category: 'Objects' },
          { word: 'pot', translation: 'หม้อ', category: 'Objects' },
          { word: 'pan', translation: 'กระทะ', category: 'Objects' },
          { word: 'lid', translation: 'ฝา', category: 'Objects' },
          { word: 'bin', translation: 'ถังขยะ', category: 'Objects' },
          { word: 'rod', translation: 'แท่ง/ไม้เท้า', category: 'Objects' },

          // ─── Objects: ≤6 ─────────────────────────────────────────────
          { word: 'chair', translation: 'เก้าอี้', category: 'Objects' },
          { word: 'table', translation: 'โต๊ะ', category: 'Objects' },
          { word: 'bottle', translation: 'ขวด', category: 'Objects' },
          { word: 'mirror', translation: 'กระจก', category: 'Objects' },
          { word: 'pillow', translation: 'หมอน', category: 'Objects' },
          { word: 'window', translation: 'หน้าต่าง', category: 'Objects' },
          { word: 'remote', translation: 'รีโมต', category: 'Objects' },
          { word: 'notebook', translation: 'สมุด', category: 'Objects' },
          { word: 'wallet', translation: 'กระเป๋าสตางค์', category: 'Objects' },
          { word: 'helmet', translation: 'หมวกกันน็อค', category: 'Objects' },
          { word: 'bucket', translation: 'ถังน้ำ', category: 'Objects' },
          { word: 'ladder', translation: 'บันได', category: 'Objects' },
          { word: 'wallet', translation: 'กระเป๋าสตางค์', category: 'Objects' },
          { word: 'stool', translation: 'ม้านั่ง', category: 'Objects' },
          { word: 'radio', translation: 'วิทยุ', category: 'Objects' },

          // ─── Objects: >6 ─────────────────────────────────────────────
          { word: 'computer', translation: 'คอมพิวเตอร์', category: 'Objects' },
          { word: 'telephone', translation: 'โทรศัพท์บ้าน', category: 'Objects' },
          { word: 'backpack', translation: 'เป้สะพายหลัง', category: 'Objects' },
          { word: 'refrigerator', translation: 'ตู้เย็น', category: 'Objects' },
          { word: 'microscope', translation: 'กล้องจุลทรรศน์', category: 'Objects' },
          { word: 'headphones', translation: 'หูฟัง', category: 'Objects' },
          { word: 'projector', translation: 'โปรเจกเตอร์', category: 'Objects' },
          { word: 'flashlight', translation: 'ไฟฉาย', category: 'Objects' },
          { word: 'airconditioner', translation: 'เครื่องปรับอากาศ', category: 'Objects' },
          { word: 'dishwasher', translation: 'เครื่องล้างจาน', category: 'Objects' },
          { word: 'calculator', translation: 'เครื่องคิดเลข', category: 'Objects' },
          { word: 'whiteboard', translation: 'ไวท์บอร์ด', category: 'Objects' },
          { word: 'bookshelf', translation: 'ชั้นวางหนังสือ', category: 'Objects' },
          { word: 'television', translation: 'โทรทัศน์', category: 'Objects' },
          { word: 'washingmachine', translation: 'เครื่องซักผ้า', category: 'Objects' },

          // ─── DailyLife: ≤4 ────────────────────────────────────────────
          { word: 'eat', translation: 'กิน', category: 'DailyLife' },
          { word: 'run', translation: 'วิ่ง', category: 'DailyLife' },
          { word: 'buy', translation: 'ซื้อ', category: 'DailyLife' },
          { word: 'sit', translation: 'นั่ง', category: 'DailyLife' },
          { word: 'use', translation: 'ใช้', category: 'DailyLife' },
          { word: 'go', translation: 'ไป', category: 'DailyLife' },
          { word: 'do', translation: 'ทำ', category: 'DailyLife' },
          { word: 'get', translation: 'ได้รับ', category: 'DailyLife' },
          { word: 'say', translation: 'พูด', category: 'DailyLife' },
          { word: 'see', translation: 'เห็น', category: 'DailyLife' },
          { word: 'pay', translation: 'จ่าย', category: 'DailyLife' },
          { word: 'dry', translation: 'ทำให้แห้ง', category: 'DailyLife' },
          { word: 'mix', translation: 'ผสม', category: 'DailyLife' },
          { word: 'cut', translation: 'ตัด', category: 'DailyLife' },
          { word: 'try', translation: 'ลอง', category: 'DailyLife' },

          // ─── DailyLife: ≤6 ────────────────────────────────────────────
          { word: 'drink', translation: 'ดื่ม', category: 'DailyLife' },
          { word: 'sleep', translation: 'นอน', category: 'DailyLife' },
          { word: 'walk', translation: 'เดิน', category: 'DailyLife' },
          { word: 'stand', translation: 'ยืน', category: 'DailyLife' },
          { word: 'write', translation: 'เขียน', category: 'DailyLife' },
          { word: 'watch', translation: 'ดู', category: 'DailyLife' },
          { word: 'brush', translation: 'แปรง', category: 'DailyLife' },
          { word: 'clean', translation: 'ทำความสะอาด', category: 'DailyLife' },
          { word: 'laugh', translation: 'หัวเราะ', category: 'DailyLife' },
          { word: 'smile', translation: 'ยิ้ม', category: 'DailyLife' },
          { word: 'carry', translation: 'ถือ', category: 'DailyLife' },
          { word: 'open', translation: 'เปิด', category: 'DailyLife' },
          { word: 'close', translation: 'ปิด', category: 'DailyLife' },
          { word: 'read', translation: 'อ่าน', category: 'DailyLife' },
          { word: 'cook', translation: 'ทำอาหาร', category: 'DailyLife' },

          // ─── DailyLife: >6 ────────────────────────────────────────────
          { word: 'exercise', translation: 'ออกกำลังกาย', category: 'DailyLife' },
          { word: 'shopping', translation: 'ซื้อของ', category: 'DailyLife' },
          { word: 'cleaning', translation: 'การทำความสะอาด', category: 'DailyLife' },
          { word: 'watching', translation: 'การดู', category: 'DailyLife' },
          { word: 'brushing', translation: 'การแปรงฟัน/ผม', category: 'DailyLife' },
          { word: 'traveling', translation: 'เดินทาง', category: 'DailyLife' },
          { word: 'sleeping', translation: 'กำลังนอน', category: 'DailyLife' },
          { word: 'chatting', translation: 'การแชท', category: 'DailyLife' },
          { word: 'drinking', translation: 'การดื่ม', category: 'DailyLife' },
          { word: 'washing', translation: 'การล้าง', category: 'DailyLife' },
          { word: 'relaxing', translation: 'ผ่อนคลาย', category: 'DailyLife' },
          { word: 'commuting', translation: 'การเดินทางไปทำงาน', category: 'DailyLife' },
          { word: 'preparing', translation: 'การเตรียมตัว', category: 'DailyLife' },
          { word: 'organizing', translation: 'จัดระเบียบ', category: 'DailyLife' },
          { word: 'meditating', translation: 'ทำสมาธิ', category: 'DailyLife' },

          // ─── Occupation: ≤4 ───────────────────────────────────────────
          { word: 'chef', translation: 'พ่อครัว', category: 'Occupation' },
          { word: 'cook', translation: 'คนทำอาหาร', category: 'Occupation' },
          { word: 'maid', translation: 'แม่บ้าน', category: 'Occupation' },
          { word: 'vet', translation: 'สัตวแพทย์', category: 'Occupation' },

          // ─── Occupation: ≤6 ───────────────────────────────────────────
          { word: 'nurse', translation: 'พยาบาล', category: 'Occupation' },
          { word: 'farmer', translation: 'ชาวนา', category: 'Occupation' },
          { word: 'guide', translation: 'มัคคุเทศก์', category: 'Occupation' },
          { word: 'pilot', translation: 'นักบิน', category: 'Occupation' },
          { word: 'clerk', translation: 'เสมียน', category: 'Occupation' },
          { word: 'guard', translation: 'ยาม', category: 'Occupation' },
          { word: 'judge', translation: 'ผู้พิพากษา', category: 'Occupation' },
          { word: 'miner', translation: 'คนขุดเหมือง', category: 'Occupation' },
          { word: 'usher', translation: 'พนักงานต้อนรับ', category: 'Occupation' },
          { word: 'priest', translation: 'นักบวช', category: 'Occupation' },
          { word: 'sailor', translation: 'กะลาสี', category: 'Occupation' },
          { word: 'doctor', translation: 'หมอ', category: 'Occupation' },
          { word: 'lawyer', translation: 'ทนาย', category: 'Occupation' },
          { word: 'artist', translation: 'ศิลปิน', category: 'Occupation' },
          { word: 'driver', translation: 'คนขับรถ', category: 'Occupation' },
          { word: 'baker', translation: 'คนอบขนม', category: 'Occupation' },
          { word: 'tailor', translation: 'ช่างตัดเสื้อ', category: 'Occupation' },
          { word: 'barber', translation: 'ช่างตัดผม', category: 'Occupation' },
          { word: 'janitor', translation: 'ภารโรง', category: 'Occupation' },
          { word: 'dancer', translation: 'นักเต้น', category: 'Occupation' },
          { word: 'singer', translation: 'นักร้อง', category: 'Occupation' },
          { word: 'waiter', translation: 'พนักงานเสิร์ฟ', category: 'Occupation' },
          { word: 'engineer', translation: 'วิศวกร', category: 'Occupation' },
          { word: 'soldier', translation: 'ทหาร', category: 'Occupation' },
          { word: 'police', translation: 'ตำรวจ', category: 'Occupation' },
          { word: 'writer', translation: 'นักเขียน', category: 'Occupation' },

          // ─── Occupation: >6 ───────────────────────────────────────────
          { word: 'firefighter', translation: 'พนักงานดับเพลิง', category: 'Occupation' },
          { word: 'photographer', translation: 'ช่างภาพ', category: 'Occupation' },
          { word: 'programmer', translation: 'นักเขียนโปรแกรม', category: 'Occupation' },
          { word: 'scientist', translation: 'นักวิทยาศาสตร์', category: 'Occupation' },
          { word: 'accountant', translation: 'นักบัญชี', category: 'Occupation' },
          { word: 'electrician', translation: 'ช่างไฟฟ้า', category: 'Occupation' },
          { word: 'receptionist', translation: 'พนักงานต้อนรับ', category: 'Occupation' },
          { word: 'mechanic', translation: 'ช่างยนต์', category: 'Occupation' },
          { word: 'pharmacist', translation: 'เภสัชกร', category: 'Occupation' },
          { word: 'translator', translation: 'นักแปล', category: 'Occupation' },
          { word: 'fire marshal', translation: 'เจ้าหน้าที่ดับเพลิง', category: 'Occupation' },
          { word: 'construction', translation: 'คนงานก่อสร้าง', category: 'Occupation' },
          { word: 'administrator', translation: 'ผู้บริหาร', category: 'Occupation' },
          { word: 'veterinarian', translation: 'สัตวแพทย์', category: 'Occupation' },
          { word: 'flight attendant', translation: 'พนักงานต้อนรับบนเครื่องบิน', category: 'Occupation' },

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
      rate = 5000;
    } else if (difficulty === 'Normal') {
      rate = 3000;
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
        className={`flex justify-between items-center px-6 py-4 text-white ${theme === 'night' ? 'bg-gray-900' : 'bg-indigo-600'
          }`}
      >
        <h1 className="text-3xl font-extrabold">Typing Balloon</h1>
        <button
          onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
          className={`p-3 rounded-full border-2 ${theme === 'night' ? 'border-gray-300 bg-gray-700' : 'border-white bg-indigo-500'
            } shadow-lg hover:opacity-90 transition`}
        >
          {theme === 'day' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* ─── Start Screen (Split into Two Sub‐Pages) ─────────────────────────────── */}
      {!gameStarted && (
        <main className="flex-grow flex flex-col justify-center items-center px-6">
          {/* Container */}
          <div className={`w-full max-w-xl mt-6 ${theme === 'night' ? 'bg-gray-800' : 'bg-indigo-50'} rounded-3xl p-8 shadow-2xl`}>
            {startStep === 1 && (
              <>
                {/* STEP 1: Choose Category */}
                <h2 className={`text-2xl font-semibold text-center mb-6 ${theme === 'night' ? 'text-white' : 'text-indigo-800'}`}>
                  เลือกหมวดหมู่คำศัพท์
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Card: Animals */}
                  <div
                    onClick={() => setCategory('Animals')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${category === 'Animals'
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
                    <span className="text-5xl mb-3">🐾</span>
                    <h3 className="text-xl font-semibold mb-1">Animals</h3>
                    <p className="text-sm opacity-80">คำศัพท์เกี่ยวกับสัตว์</p>
                  </div>

                  {/* Card: Fruits */}
                  <div
                    onClick={() => setCategory('Fruits')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${category === 'Fruits'
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
                      ${category === 'Objects'
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

                  {/* Card: DailyLife */}
                  <div
                    onClick={() => setCategory('DailyLife')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${category === 'DailyLife'
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
                    <span className="text-5xl mb-3">🏠</span>
                    <h3 className="text-xl font-semibold mb-1">DailyLife</h3>
                    <p className="text-sm opacity-80">คำทั่วไปในชีวิตประจำวัน</p>
                  </div>

                  {/* Card: Occupation */}
                  <div
                    onClick={() => setCategory('Occupation')}
                    className={`
                      cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center
                      transition-transform transform hover:scale-105 duration-200
                      ${category === 'Occupation'
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
                    <span className="text-5xl mb-3">👩‍⚕️</span>
                    <h3 className="text-xl font-semibold mb-1">Occupation</h3>
                    <p className="text-sm opacity-80">คำศัพท์หมวดอาชีพ</p>
                  </div>
                </div>

                <button
                  onClick={() => setStartStep(2)}
                  disabled={!category}
                  className={`mt-10 w-full py-4 rounded-full text-xl font-semibold transition ${category
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
                        ${difficulty === diff
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
                          ? 'Spawn ช้า (5 วิ) คำสั้น (≤4 ตัว)'
                          : diff === 'Normal'
                            ? 'Spawn ปานกลาง (3 วิ) คำกลาง (≤6 ตัว)'
                            : 'Spawn เร็ว (1.2 วิ) คำยาว (ไม่จำกัด)'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStartStep(1)}
                    className={`flex-1 py-4 rounded-full text-xl font-semibold transition ${theme === 'night' ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                      } shadow-xl`}
                  >
                    Back
                  </button>
                  <button
                    onClick={startGame}
                    disabled={!difficulty}
                    className={`flex-1 py-4 rounded-full text-xl font-semibold transition ${difficulty
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
            className={`relative flex-grow mx-6 my-4 border-2 rounded-2xl overflow-hidden shadow-xl ${theme === 'night' ? 'bg-gray-900' : 'bg-white'
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
              className={`w-full border-2 rounded-full py-4 px-6 text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition ${theme === 'night'
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
