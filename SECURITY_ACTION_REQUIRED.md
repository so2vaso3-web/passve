# ⚠️ QUAN TRỌNG: Cần thay đổi các Secrets đã bị lộ

## Các file secrets đã được xóa khỏi Git

Các file sau đã được xóa khỏi git tracking nhưng **vẫn còn trong git history**:
- `VERCEL_ENV_COPY_PASTE.txt` - Chứa MongoDB URI, NEXTAUTH_SECRET, SEPAY keys
- `VERCEL_FIREBASE_ENV.txt` - Chứa Firebase config
- `VERCEL_MISSING_ENV.txt` - Chứa các env variables
- `FACEBOOK_ENV_VARS.txt` - Chứa Facebook OAuth config

## 🔒 CẦN THAY ĐỔI NGAY:

### 1. MongoDB Atlas
- **Đổi password** cho user database trong MongoDB Atlas
- Cập nhật `MONGODB_URI` trong Vercel với password mới

### 2. NextAuth
- **Tạo NEXTAUTH_SECRET mới** (tối thiểu 32 ký tự)
- Cập nhật trong Vercel environment variables

### 3. SePay
- **Tạo lại SEPAY_SECRET_KEY mới** trong SePay dashboard
- Cập nhật trong Vercel environment variables

### 4. Google OAuth
- **Tạo lại Google OAuth Client Secret** trong Google Cloud Console
- Cập nhật `GOOGLE_CLIENT_SECRET` trong Vercel

### 5. Cloudinary (nếu có)
- **Tạo lại API Secret** trong Cloudinary dashboard
- Cập nhật `CLOUDINARY_API_SECRET` trong Vercel

### 6. Firebase (nếu có)
- **Tạo lại Firebase Service Account Key** nếu đã bị lộ
- Cập nhật trong Vercel environment variables

## 📝 Cách cập nhật trong Vercel:

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project → Settings → Environment Variables
3. Cập nhật từng biến với giá trị mới
4. **Redeploy** project để áp dụng thay đổi

## ✅ Đã được sửa:

- ✅ Xóa file secrets khỏi git tracking
- ✅ Thêm patterns vào .gitignore
- ✅ Sửa lỗ hổng bảo mật verify-payment API
- ✅ Cải thiện bảo mật admin API
- ✅ Sửa lỗi nút "Đăng ký"

## ⚠️ Lưu ý:

- Các secrets cũ vẫn còn trong git history
- Nếu cần xóa hoàn toàn khỏi history, xem `REMOVE_SECRETS_FROM_GIT.md`
- **KHÔNG BAO GIỜ** commit lại các file chứa secrets

