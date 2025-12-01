# Hướng dẫn Deploy lên Vercel

## 1. Chuẩn bị

### Database - Dùng MongoDB Atlas (Free Tier)
1. Đăng ký tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster free (M0)
3. Tạo database user
4. Whitelist IP: `0.0.0.0/0` (cho phép tất cả)
5. Lấy connection string: `mongodb+srv://username:password@cluster.mongodb.net/pass-ve-phim`

### Cloudinary (Upload ảnh)
1. Đăng ký tại [Cloudinary](https://cloudinary.com)
2. Lấy: Cloud Name, API Key, API Secret

### TMDb API
1. Đăng ký tại [TMDb](https://www.themoviedb.org/settings/api)
2. Lấy API Key

### Google OAuth
1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Tạo OAuth 2.0 Client ID
3. Thêm authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

## 2. Push lên GitHub

```bash
cd c:\web1
git init
git add .
git commit -m "Initial commit - Pass Vé Phim"
git branch -M main
git remote add origin https://github.com/your-username/pass-ve-phim.git
git push -u origin main
```

## 3. Deploy trên Vercel

1. Vào [vercel.com](https://vercel.com) và đăng nhập bằng GitHub
2. Click "Add New Project"
3. Import repository `pass-ve-phim`
4. **Cấu hình Environment Variables:**

Thêm các biến sau trong Vercel dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pass-ve-phim
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
TMDB_API_KEY=your-tmdb-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-domain.vercel.app
```

5. Click "Deploy"
6. Đợi build xong (khoảng 2-3 phút)

## 4. Sau khi deploy

1. Update `NEXTAUTH_URL` trong Vercel env vars với domain thật
2. Update Google OAuth redirect URI với domain thật
3. Chạy seed data (nếu cần):
   - Vào Vercel Functions
   - Hoặc chạy local: `npm run seed` (cần set MONGODB_URI)

## 5. Lưu ý

- **Socket.io**: Cần setup server riêng hoặc dùng Pusher thay thế
- **Payment**: Momo/VNPay cần config webhook URL trong Vercel
- **Database**: MongoDB Atlas free tier đủ cho MVP
- **Storage**: Ảnh lưu trên Cloudinary (free tier: 25GB)

## 6. Tối ưu cho Vercel

- Sử dụng Vercel Edge Functions cho API routes nhanh
- Enable ISR (Incremental Static Regeneration) cho pages tĩnh
- Sử dụng Vercel Analytics để monitor

