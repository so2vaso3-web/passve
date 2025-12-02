# 🔔 Setup Firebase Push Notifications

## Bước 1: Tạo Firebase Project (5 phút)

1. Vào: https://console.firebase.google.com/
2. Click **"Add project"**
3. Đặt tên: `Pass Vé Phim`
4. Bật/tắt Analytics tùy ý → **Continue**
5. Click **"Create project"** → Đợi → **Continue**

---

## Bước 2: Thêm Web App (3 phút)

1. Click icon **Web** (`</>`)
2. App nickname: `Pass Vé Phim Web`
3. **Bỏ tích** Firebase Hosting
4. Click **"Register app"**
5. **Copy Firebase config** (đoạn code JavaScript) → Lưu lại

---

## Bước 3: Enable Cloud Messaging (3 phút)

1. Menu **Build** → **Cloud Messaging**
2. Click **"Get started"**
3. Tab **"Cloud Messaging API (V1)"** → **Enable**
4. Tab **"Web configuration"** → Scroll xuống **"Web Push certificates"**
5. Click **"Generate key pair"** → **Copy VAPID key** → Lưu lại

---

## Bước 4: Lấy Service Account (5 phút)

1. Menu **⚙️ Settings** → **Project settings**
2. Tab **"Service accounts"**
3. Click **"Generate new private key"**
4. Popup → **Generate key**
5. File JSON download về → **Mở file** → Lưu lại:
   - `project_id`
   - `client_email`
   - `private_key` (giữ nguyên format với `\n`)

---

## Bước 5: Điền vào `.env.local`

Thêm vào cuối file `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_APP_ID=[từ Bước 2]
NEXT_PUBLIC_FIREBASE_VAPID_KEY=[từ Bước 3]
FIREBASE_PROJECT_ID=[từ Bước 4]
FIREBASE_CLIENT_EMAIL=[từ Bước 4]
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[private_key từ Bước 4]\n-----END PRIVATE KEY-----\n"
```

---

## Bước 6: Điền vào Vercel

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Thêm **10 biến** giống như Bước 5
3. Chọn **Production, Preview, Development** cho tất cả
4. **Lưu ý:** `FIREBASE_PRIVATE_KEY` phải giữ format với `\n` và ngoặc kép

---

## Bước 7: Cập nhật Service Worker

Mở file: `public/firebase-messaging-sw.js`

Thay thế đoạn này (dòng 9-16):

```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",              // ← Thay bằng giá trị từ Bước 2
  authDomain: "YOUR_AUTH_DOMAIN",      // ← Thay bằng giá trị từ Bước 2
  projectId: "YOUR_PROJECT_ID",        // ← Thay bằng giá trị từ Bước 2
  storageBucket: "YOUR_STORAGE_BUCKET", // ← Thay bằng giá trị từ Bước 2
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Thay bằng giá trị từ Bước 2
  appId: "YOUR_APP_ID"                 // ← Thay bằng giá trị từ Bước 2
});
```

---

## Bước 8: Deploy

```bash
git add .
git commit -m "setup firebase"
git push origin main
```

Vercel tự động deploy → Xong!

---

## Bước 9: Test

1. Mở: https://passve.online
2. Đăng nhập
3. Browser hỏi permission → **Cho phép**
4. Đóng tab
5. User khác gửi tin nhắn
6. → Nhận notification! 🎉

---

## ✅ Checklist

- [ ] Firebase project đã tạo
- [ ] Web app đã thêm
- [ ] Cloud Messaging enabled
- [ ] VAPID key đã có
- [ ] Service Account JSON đã download
- [ ] Đã điền 10 biến vào `.env.local`
- [ ] Đã điền 10 biến vào Vercel
- [ ] Service Worker đã cập nhật
- [ ] Đã commit và push
- [ ] Đã test trên production

---

**Làm xong 9 bước này → Push notifications sẽ hoạt động!** 🚀

