# 🚀 Setup Firebase Push Notifications - Hướng dẫn chi tiết từng bước

## ⚡ QUAN TRỌNG: Làm theo từng bước này, không bỏ sót!

---

## BƯỚC 1: Tạo Firebase Project (5 phút)

### 1.1. Vào Firebase Console
- Mở: https://console.firebase.google.com/
- Đăng nhập bằng Google account

### 1.2. Tạo Project mới
1. Click **"Add project"** (hoặc icon ➕)
2. **Project name**: `Pass Vé Phim` (hoặc tên bạn muốn)
3. Click **"Continue"**
4. **Google Analytics**: Bật hoặc tắt đều được → Click **"Continue"**
5. Chọn Analytics account (nếu bật) → Click **"Create project"**
6. Đợi Firebase tạo project (30 giây)
7. Click **"Continue"**

---

## BƯỚC 2: Thêm Web App vào Firebase (3 phút)

### 2.1. Thêm Web App
1. Trong Firebase Console, tìm icon **Web** (`</>`) ở giữa màn hình
2. Click vào icon Web
3. Điền:
   - **App nickname**: `Pass Vé Phim Web`
   - **Firebase Hosting**: **Bỏ tích** (không cần)
4. Click **"Register app"**

### 2.2. Copy Firebase Config
Sau khi register, Firebase sẽ hiển thị một đoạn code JavaScript như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**✅ Copy toàn bộ đoạn này** → Dán vào file `FIREBASE_CONFIG.txt` (tôi sẽ tạo sau)

---

## BƯỚC 3: Enable Cloud Messaging (5 phút)

### 3.1. Enable Cloud Messaging API
1. Trong Firebase Console, click menu **"Build"** (bên trái)
2. Click **"Cloud Messaging"**
3. Nếu chưa enable, click **"Get started"**
4. Click tab **"Cloud Messaging API (V1)"**
5. Click nút **"Enable"** (màu xanh)

### 3.2. Lấy VAPID Key
1. Vẫn trong **Cloud Messaging**, click tab **"Web configuration"**
2. Scroll xuống phần **"Web Push certificates"**
3. Nếu chưa có key:
   - Click **"Generate key pair"**
   - Copy **Key pair** (chuỗi dài) → Đây là VAPID key
4. Nếu đã có key:
   - Click **"Manage keys"** hoặc **"View"**
   - Copy **Key pair** → Đây là VAPID key

**✅ Copy VAPID key** → Dán vào file `FIREBASE_CONFIG.txt`

---

## BƯỚC 4: Lấy Service Account (Admin SDK) (5 phút)

### 4.1. Vào Google Cloud Console
1. Trong Firebase Console, click icon **⚙️ Settings** (góc trên trái)
2. Click **"Project settings"**
3. Scroll xuống phần **"Your apps"**
4. Tìm section **"SDK setup and configuration"**
5. Click tab **"Service accounts"**
6. Click **"Generate new private key"** (nút màu xanh)
7. Popup hiện lên → Click **"Generate key"**
8. File JSON sẽ được download về máy

### 4.2. Mở file JSON đã download
Mở file JSON (tên như: `your-project-firebase-adminsdk-xxxxx.json`), bạn sẽ thấy:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  ...
}
```

**✅ Copy các giá trị sau:**
- `project_id`
- `client_email`
- `private_key` (giữ nguyên format với `\n`)

→ Dán vào file `FIREBASE_CONFIG.txt`

---

## BƯỚC 5: Điền thông tin vào Environment Variables

Sau khi có đầy đủ thông tin từ Bước 2, 3, 4, điền vào:

### 5.1. File `.env.local` (Local development)

Mở file `.env.local` trong project, thêm vào cuối:

```env
# ============================================
# FIREBASE PUSH NOTIFICATIONS
# ============================================

# Firebase Config (Client-side) - Lấy từ Bước 2
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-from-step-3

# Firebase Admin SDK (Server-side) - Lấy từ Bước 4
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**LƯU Ý QUAN TRỌNG:**
- `FIREBASE_PRIVATE_KEY` phải giữ nguyên format với `\n` và dấu ngoặc kép
- Thay thế `Your-Private-Key-Here` bằng `private_key` từ file JSON (giữ nguyên `\n`)

### 5.2. Vercel Environment Variables (Production)

1. Vào Vercel Dashboard: https://vercel.com
2. Chọn project **passve**
3. Vào **Settings** → **Environment Variables**
4. Thêm từng biến sau (click **"Add New"** cho mỗi biến):

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development (tích cả 3)

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_VAPID_KEY
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: FIREBASE_PROJECT_ID
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: FIREBASE_CLIENT_EMAIL
Value: [giá trị từ .env.local]
Environment: Production, Preview, Development

Name: FIREBASE_PRIVATE_KEY
Value: [giá trị từ .env.local - giữ nguyên format với \n và ngoặc kép]
Environment: Production, Preview, Development
```

**⚠️ QUAN TRỌNG với FIREBASE_PRIVATE_KEY trên Vercel:**
- Khi paste vào Vercel, phải giữ nguyên format:
  ```
  "-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
  ```
- Vercel sẽ tự động escape, nhưng phải có dấu ngoặc kép ở đầu và cuối

---

## BƯỚC 6: Cập nhật Service Worker

1. Mở file: `public/firebase-messaging-sw.js`
2. Tìm đoạn code này (dòng 9-16):
   ```javascript
   firebase.initializeApp({
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   });
   ```
3. Thay thế bằng giá trị thực từ Firebase Config (Bước 2):
   ```javascript
   firebase.initializeApp({
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   });
   ```
4. **Save file**

**LƯU Ý:** Service Worker không thể đọc environment variables, nên phải hardcode config vào file này.

---

## BƯỚC 7: Commit và Deploy

1. **Commit code:**
   ```bash
   git add .
   git commit -m "feat: setup Firebase push notifications"
   git push origin main
   ```

2. **Redeploy trên Vercel:**
   - Vào Vercel Dashboard → **Deployments**
   - Click **"..."** trên deployment mới nhất
   - Click **"Redeploy"**
   - **Bỏ tích** "Use existing Build Cache"
   - Click **"Redeploy"**

---

## BƯỚC 8: Test Push Notifications

### 8.1. Test trên Production

1. Mở: https://passve.online
2. **Đăng nhập** bằng tài khoản của bạn
3. Browser sẽ hiển thị popup hỏi permission → Click **"Allow"** hoặc **"Cho phép"**
4. Mở **DevTools** (F12) → Tab **Console**
5. Tìm dòng: `"FCM token registered successfully"` → Nghĩa là đã thành công!

### 8.2. Test gửi/nhận tin nhắn

1. Đăng nhập bằng **2 tài khoản khác nhau** (hoặc 2 browser khác nhau):
   - User A: Chrome (hoặc browser 1)
   - User B: Firefox (hoặc browser 2) hoặc Incognito

2. User A gửi tin nhắn cho User B:
   - Vào một ticket → Click **"Chat"**
   - Gửi tin nhắn

3. **Đóng tab của User B** (hoặc đóng browser)
4. User A gửi tin nhắn mới
5. **User B sẽ nhận notification** trên desktop/mobile! 🎉

---

## ✅ Checklist hoàn thành

Đánh dấu ✅ khi hoàn thành:

- [ ] Firebase project đã tạo
- [ ] Web app đã thêm vào Firebase
- [ ] Firebase config đã copy (từ Bước 2)
- [ ] Cloud Messaging đã enable
- [ ] VAPID key đã copy (từ Bước 3)
- [ ] Service Account JSON đã download (Bước 4)
- [ ] `project_id` đã copy
- [ ] `client_email` đã copy
- [ ] `private_key` đã copy
- [ ] Đã thêm tất cả biến vào `.env.local`
- [ ] Đã thêm tất cả biến vào **Vercel** (9 biến)
- [ ] `public/firebase-messaging-sw.js` đã cập nhật
- [ ] Đã commit và push code
- [ ] Vercel đã redeploy
- [ ] Đã test trên production (đăng nhập → cho phép notification)
- [ ] Đã test gửi/nhận tin nhắn

---

## 🐛 Troubleshooting

### ❌ Browser không hỏi permission:

- Kiểm tra đang chạy trên HTTPS (production) hoặc localhost
- Kiểm tra browser chưa block notifications ở Settings

### ❌ Console hiện lỗi "VAPID key not configured":

- Kiểm tra `NEXT_PUBLIC_FIREBASE_VAPID_KEY` đã set trên Vercel chưa
- Kiểm tra VAPID key đúng chưa (lấy từ Firebase Console)

### ❌ Không nhận notification:

- Kiểm tra Vercel Logs → Tìm "Error sending push notification"
- Kiểm tra MongoDB → Collection `users` → Xem có `fcmToken` không
- Kiểm tra `FIREBASE_PRIVATE_KEY` trên Vercel đúng format chưa

---

## 🎉 Xong rồi!

Sau khi setup xong, push notifications sẽ hoạt động tự động:
- User đăng nhập → FCM token được register
- User gửi tin nhắn → Push notification được gửi
- User nhận notification ngay cả khi đã đóng web

**Nếu gặp lỗi, check Vercel Logs để xem chi tiết!** 🔍

