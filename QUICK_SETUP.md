# 🚀 Hướng dẫn nhanh - Tạo Google OAuth

## Bước 1: Tạo OAuth Client ID trên Google Cloud Console

1. **Vào trang Clients:**
   - Bạn đang ở: https://console.cloud.google.com/auth/clients?project=macht-e7ee5
   - Click nút **"+ Create client"** (màu xanh)

2. **Điền thông tin:**
   - **Application type:** Chọn **"Web application"**
   - **Name:** `Pass Vé Phim Web Client`
   - **Authorized JavaScript origins:** Click "ADD URI", thêm:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs:** Click "ADD URI", thêm:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **"CREATE"** hoặc **"SAVE"**

3. **Copy credentials:**
   - Google sẽ hiển thị popup với:
     - **Your Client ID:** `xxxxx.apps.googleusercontent.com`
     - **Your Client Secret:** `GOCSPX-xxxxx`
   - **Copy cả 2 giá trị này**

## Bước 2: Cập nhật vào project

Chạy lệnh sau và dán credentials vào:

```bash
npm run update-oauth
```

Hoặc tự cập nhật file `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Bước 3: Restart server

```bash
# Dừng server (Ctrl+C nếu đang chạy)
npm run dev
```

## Bước 4: Test

1. Mở http://localhost:3000
2. Click nút **"Đăng nhập"**
3. Chọn tài khoản Google
4. Cho phép ứng dụng truy cập
5. ✅ Xong!

---

## ⚠️ Lưu ý

- **Authorized redirect URI** phải khớp chính xác: `http://localhost:3000/api/auth/callback/google`
- Không có khoảng trắng thừa trong Client ID và Client Secret
- Nếu lỗi "redirect_uri_mismatch", kiểm tra lại URI trong Google Cloud Console

