# 🎮 React Game

เกมที่พัฒนาด้วย **React + Vite + TypeScript + TailwindCSS** พร้อมระบบ Deploy อัตโนมัติขึ้น **GitHub Pages**

---

## 🎞️ การติดตั้ง (Installation)

```bash
# ติดตั้ง dependencies
yarn install
```

---

## 🧪 เริ่มต้นพัฒนา (Development)

```bash
# เริ่มเซิร์เฟอร์สำหรับพัฒนา
yarn dev
```

---

## 🏗️ สร้าง Production Build (Build)

```bash
# build โปรเจ็กต์สำหรับ production
yarn build
```

---

## 🌍 Deploy ขึ้น GitHub Pages

### ✨ Step 1: ติดตั้ง gh-pages (หากยังไม่ได้ติดตั้ง)

```bash
yarn add -D gh-pages
```

### ✨ Step 2: สั่ง Deploy

```bash
yarn deploy
```

> คำสั่งนี้จะ build โปรเจ็กต์และอัปโหลดโฟลเดอร์ `dist` ไปยัง GitHub Pages อัตโนมัติ

---

## ⚙️ การตั้งค่าจำเป็น

### ✅ 1. ตั้งค่า `base` ใน `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/react-game/', // เปลี่ยนตามชื่อ repo ของคุณ
  plugins: [react()],
});
```

### ✅ 2. แก้ไข `scripts` ใน `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "vite build && gh-pages -d dist"
}
```

---

## 🔧 เปิดใช้ GitHub Pages

1. เข้าไปที่ Repository ของคุณบน GitHub
2. ไปที่เมนู `Settings` → `Pages`
3. เลือก Branch: `gh-pages` และ Folder: `/ (root)`
4. กด Save ✅

---

## 🔗 ตัวอย่างลิงก์เว็บไซต์

```
https://your-username.github.io/react-game/
```

> เปลี่ยน `your-username` และ `react-game` ให้ตรงกับ GitHub Repository ของคุณ

---

## 🙌 ขอบคุณที่เข้ามาเยี่ยมชม โปรเจกต์นี้!

หากคุณชอบหรืออยากช่วยพัฒนาเพิ่มเติม ฝากแสดง⭐️ ไว้นะครับ!
