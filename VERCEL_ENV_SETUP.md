# 🚀 Hướng dẫn cấu hình Environment Variables trên Vercel

## 📋 Checklist các biến cần thêm vào Vercel Dashboard

Sau khi deploy lên Vercel, vào **Settings** → **Environment Variables** và thêm các biến sau:

---

## ✅ 1. Database - MongoDB Atlas

```
MONGODB_URI=mongodb+srv://admpcv3_db_user:Po6A4h3j4zcoaF31@pass-ve-phim.rehtyi9.mongodb.net/pass-ve-phim?retryWrites=true&w=majority
```

**Environment**: Production, Preview, Development (chọn cả 3)

---

## ✅ 2. NextAuth - Authentication

```
NEXTAUTH_URL=https://passve.online
NEXTAUTH_SECRET=WpUGbsTcD8H5iFXm2RJgoVuMyhx1kaq4
```

**Environment**: Production, Preview, Development (chọn cả 3)

**Lưu ý**: 
- `NEXTAUTH_URL` phải là domain chính thức: `https://passve.online`
- Không dùng `http://localhost:3000` trên production

---

## ✅ 3. Google OAuth - Đăng nhập Google

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Environment**: Production, Preview, Development (chọn cả 3)

**⚠️ QUAN TRỌNG**: Cần cập nhật Google OAuth Redirect URI:
1. Vào https://console.cloud.google.com/
2. Chọn project của bạn
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Thêm **Authorized redirect URIs**:
   - `https://passve.online/api/auth/callback/google`
6. Bấm **Save**

---

## ⚠️ 4. Cloudinary - Lưu ảnh (CẦN ĐIỀN THÔNG TIN THẬT)

```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Environment**: Production, Preview, Development (chọn cả 3)

**Cách lấy thông tin Cloudinary**:
1. Đăng ký/Đăng nhập: https://cloudinary.com/
2. Vào **Dashboard**
3. Copy các thông tin:
   - **Cloud name**: Ở góc trên bên trái
   - **API Key**: Vào **Settings** → **Security**
   - **API Secret**: Vào **Settings** → **Security**

**Thay thế** `your-cloudinary-cloud-name`, `your-cloudinary-api-key`, `your-cloudinary-api-secret` bằng giá trị thật.

---

## ⚠️ 5. TMDb API - Lấy thông tin phim (CẦN ĐIỀN THÔNG TIN THẬT)

```
TMDB_API_KEY=your-tmdb-api-key
```

**Environment**: Production, Preview, Development (chọn cả 3)

**Cách lấy TMDb API Key**:
1. Đăng ký/Đăng nhập: https://www.themoviedb.org/
2. Vào **Settings** → **API**
3. Tạo API Key mới (hoặc dùng key có sẵn)
4. Copy API Key

**Thay thế** `your-tmdb-api-key` bằng API key thật.

---

## ✅ 6. Socket.io (Nếu có dùng)

```
NEXT_PUBLIC_SOCKET_URL=https://passve.online
NEXT_PUBLIC_APP_URL=https://passve.online
```

**Environment**: Production, Preview, Development (chọn cả 3)

**Lưu ý**: Nếu không dùng Socket.io, có thể bỏ qua hoặc để giá trị mặc định.

---

## ✅ 7. SePay - Nạp tiền tự động

```
SEPAY_MERCHANT_ID=SP-TEST-MQ34336A
SEPAY_SECRET_KEY=spsk_test_yoTckHq7W5cfbEyMA4n6aYNA9FqfWhN5
SEPAY_ENV=sandbox
NEXT_PUBLIC_BASE_URL=https://passve.online
```

**Environment**: Production, Preview, Development (chọn cả 3)

**Lưu ý**: 
- Hiện tại đang dùng **sandbox** (test)
- Khi chuyển sang production, cần:
  1. Lấy credentials production từ SePay
  2. Đổi `SEPAY_ENV=production`
  3. Đổi `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY` thành production credentials

---

## 📝 Tóm tắt - Copy & Paste vào Vercel

### Bước 1: Vào Vercel Dashboard
1. Đăng nhập https://vercel.com
2. Chọn project của bạn
3. Vào **Settings** → **Environment Variables**

### Bước 2: Thêm từng biến

**Copy từng dòng và paste vào Vercel** (chọn Environment: Production, Preview, Development cho tất cả):

```
MONGODB_URI=mongodb+srv://admpcv3_db_user:Po6A4h3j4zcoaF31@pass-ve-phim.rehtyi9.mongodb.net/pass-ve-phim?retryWrites=true&w=majority

NEXTAUTH_URL=https://passve.online
NEXTAUTH_SECRET=WpUGbsTcD8H5iFXm2RJgoVuMyhx1kaq4

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

TMDB_API_KEY=your-tmdb-api-key

NEXT_PUBLIC_SOCKET_URL=https://passve.online
NEXT_PUBLIC_APP_URL=https://passve.online

SEPAY_MERCHANT_ID=SP-TEST-MQ34336A
SEPAY_SECRET_KEY=spsk_test_yoTckHq7W5cfbEyMA4n6aYNA9FqfWhN5
SEPAY_ENV=sandbox
NEXT_PUBLIC_BASE_URL=https://passve.online
```

### Bước 3: Cập nhật Google OAuth Redirect URI

1. Vào https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click vào OAuth 2.0 Client ID
4. Thêm **Authorized redirect URIs**:
   ```
   https://passve.online/api/auth/callback/google
   ```
5. **Save**

### Bước 4: Điền Cloudinary và TMDb (nếu chưa có)

- **Cloudinary**: Thay `your-cloudinary-cloud-name`, `your-cloudinary-api-key`, `your-cloudinary-api-secret`
- **TMDb**: Thay `your-tmdb-api-key`

### Bước 5: Redeploy

Sau khi thêm tất cả env variables:
1. Vào **Deployments**
2. Click vào deployment mới nhất
3. Bấm **Redeploy** (hoặc push code mới lên GitHub để tự động deploy)

---

## ✅ Checklist hoàn thành

- [ ] Đã thêm tất cả env variables vào Vercel
- [ ] Đã cập nhật Google OAuth Redirect URI
- [ ] Đã điền Cloudinary credentials (nếu có)
- [ ] Đã điền TMDb API key (nếu có)
- [ ] Đã redeploy sau khi thêm env variables
- [ ] Đã test đăng nhập Google trên production
- [ ] Đã test upload ảnh (nếu có Cloudinary)
- [ ] Đã test nạp tiền SePay

---

## 🐛 Troubleshooting

### Lỗi: "Invalid redirect URI" khi đăng nhập Google
- Kiểm tra Google OAuth Redirect URI đã thêm `https://passve.online/api/auth/callback/google` chưa
- Đảm bảo `NEXTAUTH_URL=https://passve.online` trong Vercel

### Lỗi: "Cloudinary upload failed"
- Kiểm tra Cloudinary credentials đã đúng chưa
- Kiểm tra env variables đã được thêm vào Vercel chưa
- Redeploy sau khi thêm env variables

### Lỗi: "SePay chưa được cấu hình"
- Kiểm tra `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY` đã thêm vào Vercel chưa
- Redeploy sau khi thêm env variables

---

**💡 Tip**: Sau khi thêm env variables, luôn **Redeploy** để áp dụng thay đổi!

