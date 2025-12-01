# Hướng dẫn tạo MongoDB Atlas (MIỄN PHÍ)

## Bước 1: Đăng ký/Đăng nhập
1. Vào: https://cloud.mongodb.com
2. Bấm "Try Free" hoặc "Sign In"
3. Đăng ký bằng email (miễn phí)

## Bước 2: Tạo Cluster
1. Sau khi đăng nhập, chọn "Build a Database"
2. Chọn **FREE** (M0) - Shared
3. Chọn Cloud Provider: **AWS** (hoặc Google Cloud)
4. Chọn Region: **Singapore (ap-southeast-1)** (gần VN nhất)
5. Bấm "Create"

## Bước 3: Tạo Database User
1. Vào tab **"Database Access"** (bên trái)
2. Bấm **"Add New Database User"**
3. Chọn **"Password"** authentication
4. Điền:
   - **Username**: `admin` (hoặc tên bạn muốn)
   - **Password**: Tự đặt (ví dụ: `MyPass123!`)
5. Database User Privileges: Chọn **"Read and write to any database"**
6. Bấm **"Add User"**

## Bước 4: Cho phép IP truy cập
1. Vào tab **"Network Access"** (bên trái)
2. Bấm **"Add IP Address"**
3. Bấm **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Bấm **"Confirm"**

## Bước 5: Lấy Connection String
1. Vào tab **"Database"** (bên trái)
2. Bấm nút **"Connect"** trên cluster của bạn
3. Chọn **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy connection string, ví dụ:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Bước 6: Thay thế trong Connection String
- Thay `<username>` bằng username bạn vừa tạo (ví dụ: `admin`)
- Thay `<password>` bằng password bạn vừa tạo (ví dụ: `MyPass123!`)
- Thêm tên database vào cuối: `...mongodb.net/pass-ve-phim?retryWrites=true&w=majority`

**Ví dụ sau khi thay:**
```
mongodb+srv://admin:MyPass123!@cluster0.xxxxx.mongodb.net/pass-ve-phim?retryWrites=true&w=majority
```

## Bước 7: Dán vào Vercel
- Key: `MONGODB_URI`
- Value: Connection string đã thay thế ở trên

---

**Lưu ý:**
- MongoDB Atlas FREE có giới hạn 512MB storage (đủ cho test/small app)
- Cluster mất ~3-5 phút để tạo xong
- Nếu quên password, phải tạo user mới

