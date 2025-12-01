# Hướng dẫn cấu hình Google OAuth

Để cho phép khách hàng đăng nhập bằng Google, bạn cần tạo OAuth credentials từ Google Cloud Console.

## Bước 1: Tạo Project trên Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Đi tới **APIs & Services** > **Credentials**

## Bước 2: Tạo OAuth 2.0 Client ID

1. Click **Create Credentials** > **OAuth client ID**
2. Nếu chưa có, bạn sẽ được yêu cầu cấu hình **OAuth consent screen**:
   - Chọn **External** (cho development) hoặc **Internal** (cho G Suite)
   - Điền thông tin:
     - App name: `Pass Vé Phim`
     - User support email: Email của bạn
     - Developer contact: Email của bạn
   - Click **Save and Continue**
   - Ở màn hình **Scopes**, click **Save and Continue**
   - Ở màn hình **Test users**, thêm email test (nếu cần), click **Save and Continue**
   - Review và click **Back to Dashboard**

3. Tạo OAuth Client ID:
   - Application type: **Web application**
   - Name: `Pass Vé Phim Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **Create**

4. Copy **Client ID** và **Client Secret**

## Bước 3: Cập nhật file .env.local

Mở file `.env.local` và cập nhật:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Bước 4: Restart server

Sau khi cập nhật `.env.local`, restart dev server:

```bash
# Dừng server (Ctrl+C)
npm run dev
```

## Bước 5: Test đăng nhập

1. Truy cập http://localhost:3000
2. Click nút **Đăng nhập**
3. Chọn tài khoản Google
4. Cho phép ứng dụng truy cập
5. Bạn sẽ được redirect về trang chủ

## Lưu ý cho Production

Khi deploy lên production (Vercel, etc.):

1. Thêm domain production vào **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```

2. Thêm redirect URI production:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. Cập nhật `NEXTAUTH_URL` trong environment variables:
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại redirect URI trong Google Cloud Console
- Đảm bảo URI khớp chính xác (bao gồm http/https, port, path)

### Lỗi "access_denied"
- Kiểm tra OAuth consent screen đã được cấu hình
- Đảm bảo email test đã được thêm (nếu app ở chế độ Testing)

### Lỗi "invalid_client"
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env.local
- Đảm bảo không có khoảng trắng thừa

