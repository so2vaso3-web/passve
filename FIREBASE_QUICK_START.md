# ⚡ Firebase Push Notifications - Quick Start (15 phút)

## 🎯 Làm 3 việc này:

### 1️⃣ Setup Firebase (10 phút)
👉 **Làm theo:** `SETUP_FIREBASE_COMPLETE.md` (hướng dẫn chi tiết từng bước)

**Tóm tắt nhanh:**
1. Tạo Firebase project: https://console.firebase.google.com/
2. Thêm Web app → Copy Firebase config
3. Enable Cloud Messaging → Lấy VAPID key
4. Download Service Account JSON → Lấy `project_id`, `client_email`, `private_key`

### 2️⃣ Điền Environment Variables (3 phút)

**A. File `.env.local`:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**B. Vercel Environment Variables:**
- Vào Vercel → Settings → Environment Variables
- Thêm 10 biến ở trên (giống y hệt)

### 3️⃣ Cập nhật Service Worker (2 phút)

Mở `public/firebase-messaging-sw.js`, thay thế:
```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",      // ← Thay bằng giá trị thực
  authDomain: "YOUR_AUTH_DOMAIN", // ← Thay bằng giá trị thực
  projectId: "YOUR_PROJECT_ID",   // ← Thay bằng giá trị thực
  storageBucket: "YOUR_STORAGE_BUCKET", // ← Thay bằng giá trị thực
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Thay bằng giá trị thực
  appId: "YOUR_APP_ID"          // ← Thay bằng giá trị thực
});
```

---

## ✅ Xong! Deploy và Test

1. `git add . && git commit -m "setup firebase" && git push`
2. Vercel tự deploy
3. Test: Đăng nhập → Cho phép notification → Đóng tab → Gửi tin nhắn → Nhận notification! 🎉

---

## 📚 Chi tiết đầy đủ

👉 Xem file **`SETUP_FIREBASE_COMPLETE.md`** để có hướng dẫn chi tiết từng bước với screenshots và troubleshooting.

