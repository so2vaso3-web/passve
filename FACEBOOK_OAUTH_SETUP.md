# Hướng dẫn cấu hình Facebook OAuth

Để cho phép khách hàng đăng nhập bằng Facebook, bạn cần tạo Facebook App từ Facebook Developers Console.

## Bước 1: Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook của bạn
3. Click **My Apps** → **Create App**
4. Chọn loại app: **Consumer** (hoặc **Business**)
5. Điền thông tin:
   - **App Name**: `Pass Vé Phim` (hoặc tên bạn muốn)
   - **App Contact Email**: Email của bạn
   - **Business Account** (tùy chọn): Có thể bỏ qua
6. Click **Create App**

## Bước 2: Thêm Facebook Login Product

1. Trong App Dashboard, tìm **Add Product**
2. Click vào **Facebook Login**
3. Click **Set Up**
4. Chọn **Web** platform

## Bước 3: Cấu hình OAuth Redirect URIs

1. Vào **Facebook Login** → **Settings**
2. Thêm **Valid OAuth Redirect URIs**:
   ```
   https://passve.online/api/auth/callback/facebook
   http://localhost:3000/api/auth/callback/facebook
   ```
3. Thêm **Site URL**:
   ```
   https://passve.online
   ```
4. Click **Save Changes**

## Bước 4: Lấy App ID và App Secret

1. Vào **Settings** → **Basic**
2. Copy **App ID** → Đây là `FACEBOOK_CLIENT_ID`
3. Click **Show** ở **App Secret** → Copy → Đây là `FACEBOOK_CLIENT_SECRET`
4. **Lưu ý**: App Secret chỉ hiển thị một lần, hãy lưu lại cẩn thận!

## Bước 5: Cấu hình App Domains

1. Vào **Settings** → **Basic**
2. Scroll xuống **App Domains**
3. Thêm domain: `passve.online` (không cần `https://`)
4. Click **Save Changes**

## Bước 6: Cập nhật file .env.local

Mở file `.env.local` và thêm:

```env
FACEBOOK_CLIENT_ID=your-app-id-here
FACEBOOK_CLIENT_SECRET=your-app-secret-here
```

**Ví dụ:**
```env
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

## Bước 7: Cấu hình Privacy Policy URL (Bắt buộc cho Production)

Facebook yêu cầu Privacy Policy URL cho app production:

1. Vào **Settings** → **Basic**
2. Scroll xuống **Privacy Policy URL**
3. Thêm URL: `https://passve.online/privacy`
4. Thêm **User Data Deletion** URL (tùy chọn): `https://passve.online/privacy`
5. Click **Save Changes**

## Bước 8: Submit App for Review (Chỉ cần khi publish)

- Nếu chỉ test với tài khoản của bạn, có thể bỏ qua bước này
- Để publish app cho tất cả user, cần submit app để Facebook review
- Vào **App Review** → **Permissions and Features** → Request các permissions cần thiết

## Bước 9: Test App Mode

Khi app ở **Development Mode**:
- Chỉ các admin, developer, tester của app mới đăng nhập được
- Để test với user khác, cần thêm họ vào **Roles** → **Test Users**

## Bước 10: Restart Server

Sau khi cập nhật `.env.local`, restart dev server:

```bash
# Dừng server (Ctrl+C)
npm run dev
```

## Bước 11: Test đăng nhập

1. Truy cập https://passve.online/api/auth/signin
2. Click nút **Đăng nhập với Facebook**
3. Cho phép ứng dụng truy cập thông tin
4. Bạn sẽ được redirect về trang chủ

## Troubleshooting

### Lỗi: "App Not Setup: This app is still in development mode"

- Vào **Settings** → **Basic**
- Tìm **App Mode** → Chuyển sang **Live** (cần submit app review trước)
- Hoặc thêm user vào **Roles** → **Test Users** nếu muốn test

### Lỗi: "Invalid OAuth Redirect URI"

- Kiểm tra lại **Valid OAuth Redirect URIs** trong Facebook Login Settings
- Đảm bảo URL chính xác: `https://passve.online/api/auth/callback/facebook`

### Lỗi: "App Secret không hợp lệ"

- Kiểm tra lại `FACEBOOK_CLIENT_SECRET` trong `.env.local`
- Đảm bảo không có khoảng trắng thừa
- Lấy lại App Secret từ Facebook Developers Console nếu cần

---

**Lưu ý quan trọng:**
- App Secret là thông tin nhạy cảm, không commit vào Git
- Luôn thêm `.env.local` vào `.gitignore`
- Trên Vercel, thêm environment variables qua Dashboard

