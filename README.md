# 🎵 Kapomtify

> **Project Database (CPE241)** — โปรเจกต์รายวิชา Database Systems ภาควิชาวิศวกรรมคอมพิวเตอร์

---

## 📖 Overview

**Kapomtify** เป็นเว็บแอปพลิเคชันที่พัฒนาขึ้นเป็นส่วนหนึ่งของรายวิชา **CPE241 — Database Systems** โดยมีจุดประสงค์เพื่อประยุกต์ใช้ความรู้ด้านการออกแบบและจัดการระบบฐานข้อมูลในสถานการณ์จริง ผ่านการสร้างระบบที่มีทั้งฝั่ง Frontend, Backend และ Database ที่ทำงานร่วมกันแบบครบวงจร

โปรเจกต์นี้พัฒนาด้วยสถาปัตยกรรมแบบ **Full-stack JavaScript** ประกอบด้วย 3 ส่วนหลัก ได้แก่

- **Client (Frontend)** — พัฒนาด้วย **React** สำหรับแสดงผลและให้ผู้ใช้โต้ตอบกับระบบ พร้อมความสามารถในการสร้างกราฟ (Recharts) และส่งออกเอกสาร PDF (jsPDF, html2canvas)
- **Server (Backend)** — พัฒนาด้วย **Node.js** ทำหน้าที่จัดการ API, การยืนยันตัวตน (Authentication) ผ่าน JWT และเข้ารหัสรหัสผ่านด้วย bcrypt
- **Database** — ใช้ **PostgreSQL 17** ทำงานผ่าน Docker container พร้อมระบบจัดการผ่าน Web UI ด้วย **Adminer**

ทั้งระบบถูกจัดการผ่าน **Docker Compose** เพื่อให้สามารถติดตั้งและรันได้สะดวกบนทุกเครื่อง

### 🛠 Tech Stack

| ส่วนของระบบ | เทคโนโลยีที่ใช้ |
|------------|----------------|
| Frontend | React, lucide-react, Recharts, jsPDF, html2canvas |
| Backend | Node.js, JWT (jsonwebtoken), bcryptjs, pdfkit |
| Database | PostgreSQL 17 |
| DB Admin Tool | Adminer |
| Containerization | Docker, Docker Compose |

### 🚀 การติดตั้งและใช้งานเบื้องต้น

```bash
# 1. ติดตั้ง dependencies และตั้งค่าเริ่มต้น
npm run setup

# 2. รัน Database ผ่าน Docker
npm run docker:up

# 3. รัน Backend Server
npm run dev:server

# 4. รัน Frontend Client (เปิด terminal ใหม่)
npm run dev:client

# หรือใช้คำสั่งเดียวเพื่อรัน Database + Server พร้อมกัน
npm run start-all
```

หลังจากรันสำเร็จ สามารถเข้าใช้งานได้ที่:
- **Web Application** → ตามพอร์ตของ client
- **Adminer (Database UI)** → [http://localhost:8888](http://localhost:8888)
- **PostgreSQL** → `localhost:5433`

---

## 👥 Member (สมาชิกในทีม)

| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา |
|:----:|:------------|:------------:|
| 1 | Kittithat Disthanakornkun | 67070501004 |
| 2 | Jetanin Naitho            | 67070501011 |
| 3 | Naphat Utabuawong         | 67070501015 |
| 4 | Thanatip Nitinantakul     | 67070501023 |
| 5 | Nantakorn Pinsupaporn     | 67070501028 |
| 6 | Kawinpop Churari          | 67070501079 |

---

## 📁 Project Structure (โครงสร้างโปรเจกต์)

```
kapomtify/
├── client/                  # ส่วน Frontend (React Application)
│   └── ...                  # โค้ดของฝั่งผู้ใช้ทั้งหมด เช่น components, pages, assets
│
├── server/                  # ส่วน Backend (Node.js API Server)
│   └── ...                  # โค้ดของ API, controllers, routes, middleware
│
├── database/
│   └── init/                # สคริปต์ SQL เริ่มต้นสำหรับสร้างตารางและข้อมูลตัวอย่าง
│                            # (จะถูกรันอัตโนมัติเมื่อ container PostgreSQL ถูกสร้างครั้งแรก)
│
├── scripts/
│   └── setup.js             # สคริปต์สำหรับติดตั้ง dependencies และตั้งค่าเริ่มต้น
│
├── docker-compose.yml       # ไฟล์กำหนดค่า Docker (PostgreSQL + Adminer)
├── package.json             # ไฟล์จัดการ dependencies และคำสั่งหลักของโปรเจกต์
├── package-lock.json        # ไฟล์ล็อกเวอร์ชันของ dependencies
└── .gitignore               # ไฟล์ที่ไม่ต้องการให้ Git ติดตาม
```

### 📌 รายละเอียดของแต่ละโฟลเดอร์

#### 🖥 `client/`
เก็บโค้ดทั้งหมดของฝั่ง Frontend ที่พัฒนาด้วย React ซึ่งทำหน้าที่แสดงผล UI ให้ผู้ใช้โต้ตอบกับระบบ รวมถึงการแสดงกราฟต่าง ๆ และการ Export ข้อมูลเป็นเอกสาร PDF

#### ⚙️ `server/`
เก็บโค้ดทั้งหมดของฝั่ง Backend ที่พัฒนาด้วย Node.js ทำหน้าที่:
- รับและตอบสนอง HTTP Request จาก Client
- จัดการระบบ Authentication ผ่าน JWT
- เข้ารหัสรหัสผ่านด้วย bcrypt
- เชื่อมต่อและสื่อสารกับฐานข้อมูล PostgreSQL

#### 🗄 `database/init/`
เก็บไฟล์ SQL ที่ใช้เป็น **initialization script** ของ PostgreSQL เมื่อรัน Docker ครั้งแรก ระบบจะอ่านไฟล์ในโฟลเดอร์นี้และสร้างตาราง รวมถึงข้อมูลตัวอย่างให้โดยอัตโนมัติ ทำให้สมาชิกทุกคนในทีมมีโครงสร้างฐานข้อมูลตรงกัน

#### 🔧 `scripts/`
รวบรวมสคริปต์เสริมต่าง ๆ สำหรับการตั้งค่าโปรเจกต์ เช่น `setup.js` ที่ช่วยติดตั้ง dependencies ของทั้ง client และ server ในครั้งเดียว

#### 🐳 `docker-compose.yml`
ไฟล์กำหนดค่า Docker Compose ซึ่งสร้าง 2 บริการหลัก ได้แก่
- **db** — PostgreSQL 17 บนพอร์ต `5433`
- **adminer** — เครื่องมือจัดการฐานข้อมูลผ่าน Web UI บนพอร์ต `8888`

---

> 📚 **CPE241 — Database Systems**  
> Project: Kapomtify
