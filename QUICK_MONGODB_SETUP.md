# 🚀 Hướng dẫn nhanh kết nối MongoDB Atlas

## Bước hiện tại: Bạn đang ở modal "Connect to pass-ve-phim"

### ✅ Đã hoàn thành:
- ✅ IP address đã được thêm: `113.180.15.233`
- ✅ Database user đã tạo:
  - Username: `admpcv3_db_user`
  - Password: `Po6A4h3j4zcoaF31` (NHỚ COPY PASSWORD NÀY!)

---

## Bước tiếp theo:

### 1. Bấm nút "Choose a connection method" (màu xanh)

### 2. Chọn "Connect your application" (icon code/terminal)

### 3. Chọn:
   - **Driver:** Node.js
   - **Version:** 5.5 or later

### 4. Copy connection string, sẽ có dạng:
   ```
   mongodb+srv://admpcv3_db_user:<password>@pass-ve-phim.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Thay `<password>` bằng password của bạn: `Po6A4h3j4zcoaF31`

### 6. Thêm database name vào cuối (trước `?`):
   ```
   mongodb+srv://admpcv3_db_user:Po6A4h3j4zcoaF31@pass-ve-phim.xxxxx.mongodb.net/pass-ve-phim?retryWrites=true&w=majority
   ```

### 7. Cập nhật file `.env.local`:
   Mở file `.env.local` và thay dòng:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pass-ve-phim
   ```
   
   Thành:
   ```env
   MONGODB_URI=mongodb+srv://admpcv3_db_user:Po6A4h3j4zcoaF31@pass-ve-phim.xxxxx.mongodb.net/pass-ve-phim?retryWrites=true&w=majority
   ```
   (Thay `xxxxx` bằng cluster name thật của bạn)

### 8. Restart server:
   ```bash
   npm run dev
   ```

---

## ✅ Kiểm tra kết nối:

Sau khi restart, nếu thành công:
- ✅ Không còn lỗi timeout
- ✅ Profile page load được
- ✅ Có thể đăng tin và thấy trên trang chủ

---

## ⚠️ Lưu ý:

- **KHÔNG** share password này với ai
- **KHÔNG** commit file `.env.local` lên GitHub
- Password: `Po6A4h3j4zcoaF31` - LƯU LẠI AN TOÀN!

