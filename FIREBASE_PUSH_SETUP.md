# 🔔 Hướng dẫn Setup Push Notifications với Firebase Cloud Messaging

## Bước 1: Tạo Firebase Project

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc chọn project có sẵn
3. Điền tên project: `Pass Vé Phim` (hoặc tên bạn muốn)
4. Bật Google Analytics (tùy chọn)
5. Click **"Create project"**

## Bước 2: Thêm Web App vào Firebase

1. Trong Firebase Console, click icon **Web** (`</>`)
2. Điền:
   - **App nickname**: `Pass Vé Phim Web`
   - **Firebase Hosting**: Không cần (skip)
3. Click **"Register app"**
4. Copy Firebase config object (sẽ hiển thị sau khi register)

## Bước 3: Enable Cloud Messaging

1. Trong Firebase Console, vào **Build** → **Cloud Messaging**
2. Click **"Get started"** (nếu chưa enable)
3. Vào tab **"Cloud Messaging API (V1)"**
4. Enable **"Cloud Messaging API (V1)"**
5. Vào tab **"Web configuration"**
6. Generate **Web Push certificates** (hoặc dùng Key pair)
7. Copy **Server key** (sẽ dùng cho Firebase Admin SDK)

## Bước 4: Lấy Service Account (cho Firebase Admin SDK)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project Firebase của bạn
3. Vào **IAM & Admin** → **Service Accounts**
4. Tìm service account mặc định (thường có email: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
5. Click vào service account → tab **"Keys"**
6. Click **"Add Key"** → **"Create new key"**
7. Chọn **JSON**
8. Download file JSON về máy
9. Mở file JSON và copy các giá trị:
   - `project_id`
   - `client_email`
   - `private_key`

## Bước 5: Lấy VAPID Key

1. Trong Firebase Console → **Project Settings** → **Cloud Messaging**
2. Scroll xuống phần **"Web Push certificates"**
3. Nếu chưa có, click **"Generate key pair"**
4. Copy **Key pair** (VAPID key)

## Bước 6: Thêm Environment Variables

### Thêm vào `.env.local` (local development):

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

### Thêm vào Vercel Environment Variables:

1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Thêm tất cả các biến ở trên
3. **QUAN TRỌNG**: Với `FIREBASE_PRIVATE_KEY`, phải giữ nguyên format với `\n` và dấu ngoặc kép

## Bước 7: Cập nhật Service Worker

1. Mở file `public/firebase-messaging-sw.js`
2. Thay thế các giá trị placeholder bằng config từ Firebase:
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

**LƯU Ý**: Service Worker không thể đọc environment variables, nên phải hardcode config vào file này.

## Bước 8: Test Push Notifications

1. Deploy lên Vercel hoặc chạy `npm run dev`
2. Đăng nhập vào website
3. Browser sẽ hỏi permission để nhận notifications
4. Cho phép notifications
5. Test bằng cách gửi tin nhắn từ một user khác
6. Đóng tab → Tin nhắn mới sẽ hiển thị notification

## Troubleshooting

### Notification không hiển thị:
- Kiểm tra browser đã cho phép notifications chưa
- Kiểm tra FCM token đã được lưu vào database chưa (check User.fcmToken)
- Kiểm tra Firebase config đúng chưa
- Kiểm tra service worker đã được register chưa

### Lỗi "Messaging not available":
- Đảm bảo đang chạy trên HTTPS (hoặc localhost)
- Kiểm tra Firebase SDK đã được load chưa

### Lỗi "VAPID key not configured":
- Đảm bảo `NEXT_PUBLIC_FIREBASE_VAPID_KEY` đã được set
- VAPID key phải từ Firebase Console → Cloud Messaging → Web Push certificates

## Tính năng

- ✅ Push notifications khi có tin nhắn mới (kể cả khi đóng tab)
- ✅ Click notification → Mở app và điều hướng đến chat
- ✅ Hiển thị tên người gửi và nội dung tin nhắn
- ✅ Badge và sound khi có notification
- ✅ Tự động đăng ký FCM token khi user đăng nhập

