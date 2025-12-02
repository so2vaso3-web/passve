# ✅ Checklist: Setup Push Notifications để nhận tin nhắn khi thoát web

## 📋 Tổng quan

Push notifications đã được code sẵn 100%. Bạn chỉ cần **setup Firebase** và **cấu hình environment variables**.

---

## 🚀 Bước 1: Setup Firebase (15-20 phút)

**Làm theo file:** `FIREBASE_PUSH_SETUP.md` (đã có sẵn trong project)

### Tóm tắt nhanh:

1. **Tạo Firebase Project**
   - Vào https://console.firebase.google.com/
   - Tạo project mới: "Pass Vé Phim"

2. **Thêm Web App**
   - Click icon Web (`</>`)
   - Register app → Copy Firebase config

3. **Enable Cloud Messaging**
   - Build → Cloud Messaging → Get started
   - Enable "Cloud Messaging API (V1)"
   - Generate Web Push certificates → Copy VAPID key

4. **Lấy Service Account (cho Admin SDK)**
   - Google Cloud Console → IAM & Admin → Service Accounts
   - Create key → JSON → Download
   - Copy: `project_id`, `client_email`, `private_key`

---

## 🔧 Bước 2: Cập nhật Environment Variables

### A. Thêm vào `.env.local` (local development):

```env
# Firebase Config (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
```

### B. Thêm vào Vercel Environment Variables:

1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Thêm tất cả các biến ở trên
3. **QUAN TRỌNG**: 
   - `FIREBASE_PRIVATE_KEY` phải giữ nguyên format với `\n` và dấu ngoặc kép
   - Chọn **Production, Preview, Development** cho tất cả biến

---

## 📝 Bước 3: Cập nhật Service Worker

1. Mở file: `public/firebase-messaging-sw.js`
2. Thay thế các giá trị placeholder bằng Firebase config của bạn:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();
```

**LƯU Ý**: Service Worker không thể đọc environment variables, nên phải hardcode config vào file này.

---

## ✅ Bước 4: Redeploy & Test

1. **Commit và push code lên GitHub**
2. **Vercel sẽ tự động deploy**
3. **Test trên production**:
   - Đăng nhập vào https://passve.online
   - Browser sẽ hỏi permission → **Cho phép notifications**
   - Đóng tab
   - Gửi tin nhắn từ user khác
   - → Bạn sẽ nhận notification trên desktop/mobile

---

## 🎯 Cách hoạt động:

1. **User đăng nhập** → Browser hỏi permission
2. **User cho phép** → FCM token được lưu vào database
3. **User A gửi tin nhắn cho User B**:
   - API `/api/chat/messages` nhận tin nhắn
   - Lấy `fcmToken` của User B từ database
   - Gửi push notification qua Firebase Admin SDK
4. **User B nhận notification** (kể cả khi đã đóng web):
   - Hiển thị notification trên desktop/mobile
   - Click notification → Mở web và điều hướng đến chat

---

## 🔍 Kiểm tra đã setup đúng chưa:

### ✅ Checklist:

- [ ] Firebase project đã tạo
- [ ] Cloud Messaging đã enable
- [ ] VAPID key đã có
- [ ] Service Account JSON đã download
- [ ] Tất cả environment variables đã thêm vào `.env.local`
- [ ] Tất cả environment variables đã thêm vào **Vercel**
- [ ] `public/firebase-messaging-sw.js` đã cập nhật với Firebase config
- [ ] Đã commit và push code
- [ ] Vercel đã deploy
- [ ] Đã test trên production (đăng nhập → cho phép notification)

---

## 🐛 Troubleshooting:

### ❌ Notification không hiển thị:

1. **Kiểm tra browser permission:**
   - Settings → Site Settings → Notifications → Cho phép

2. **Kiểm tra FCM token đã được lưu:**
   - Vào MongoDB → Collection `users`
   - Tìm user của bạn → Xem có field `fcmToken` không

3. **Kiểm tra Vercel Logs:**
   - Vercel Dashboard → Logs
   - Tìm "Error sending push notification" → Xem error cụ thể

4. **Kiểm tra Firebase Console:**
   - Cloud Messaging → Delivery logs
   - Xem có message nào failed không

### ❌ Lỗi "Messaging not available":

- Đảm bảo đang chạy trên **HTTPS** (production) hoặc **localhost**
- Kiểm tra Firebase SDK đã được load chưa

### ❌ Lỗi "VAPID key not configured":

- Kiểm tra `NEXT_PUBLIC_FIREBASE_VAPID_KEY` đã set trên Vercel chưa
- VAPID key phải từ Firebase Console → Cloud Messaging → Web Push certificates

---

## 📱 Tính năng đã có sẵn:

- ✅ Push notifications khi có tin nhắn mới (kể cả khi đóng tab)
- ✅ Click notification → Mở app và điều hướng đến chat
- ✅ Hiển thị tên người gửi và nội dung tin nhắn
- ✅ Badge và sound khi có notification
- ✅ Tự động đăng ký FCM token khi user đăng nhập
- ✅ Toast notification khi app đang mở

---

## 💡 Lưu ý quan trọng:

1. **Push notifications chỉ hoạt động trên HTTPS** (production) hoặc localhost
2. **User phải cho phép notifications** trên browser
3. **Service Worker phải được register** (tự động khi deploy)
4. **FCM token sẽ được tự động register** khi user đăng nhập

---

**Sau khi setup xong → Test ngay để đảm bảo hoạt động!** 🚀

