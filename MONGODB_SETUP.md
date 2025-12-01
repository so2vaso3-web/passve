# Hướng dẫn kết nối MongoDB cho Pass Vé Phim

## Cách 1: MongoDB Atlas (Miễn phí - Khuyên dùng)

### Bước 1: Tạo tài khoản MongoDB Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí (Free tier)
3. Chọn **Free Shared** cluster

### Bước 2: Tạo Cluster
1. Chọn Cloud Provider: **AWS** hoặc **Google Cloud**
2. Chọn Region gần Việt Nam: **Singapore (ap-southeast-1)**
3. Click **Create Cluster** (mất khoảng 3-5 phút)

### Bước 3: Tạo Database User
1. Vào **Database Access** (bên trái)
2. Click **Add New Database User**
3. Chọn **Password** authentication
4. Username: `passvephim` (hoặc tên bạn muốn)
5. Password: Tạo password mạnh (lưu lại!)
6. Database User Privileges: **Atlas admin** hoặc **Read and write to any database**
7. Click **Add User**

### Bước 4: Whitelist IP Address
1. Vào **Network Access** (bên trái)
2. Click **Add IP Address**
3. Chọn **Allow Access from Anywhere** (0.0.0.0/0) - cho development
   - Hoặc thêm IP cụ thể của bạn cho production
4. Click **Confirm**

### Bước 5: Lấy Connection String
1. Vào **Database** (bên trái)
2. Click **Connect** trên cluster của bạn
3. Chọn **Connect your application**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy connection string, ví dụ:
   ```
   mongodb+srv://passvephim:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Bước 6: Cập nhật .env.local
Mở file `.env.local` và thay thế:
```env
MONGODB_URI=mongodb+srv://passvephim:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pass-ve-phim?retryWrites=true&w=majority
```
**Lưu ý:** Thay `YOUR_PASSWORD` bằng password bạn đã tạo ở Bước 3, và `cluster0.xxxxx` bằng cluster name của bạn.

---

## Cách 2: MongoDB Local (Cài đặt trên máy)

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Cài đặt MongoDB
3. Khởi động MongoDB service:
   ```powershell
   net start MongoDB
   ```
4. Connection string mặc định:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pass-ve-phim
   ```

### Mac/Linux:
```bash
# Cài đặt với Homebrew (Mac)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Hoặc với Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Kiểm tra kết nối

Sau khi cấu hình xong, restart server:
```bash
npm run dev
```

Nếu kết nối thành công, bạn sẽ thấy:
- Không còn lỗi timeout
- Profile page load được data
- Có thể đăng tin và thấy trên trang chủ

---

## Troubleshooting

### Lỗi "Authentication failed"
- Kiểm tra lại username và password trong connection string
- Đảm bảo đã tạo database user đúng

### Lỗi "IP not whitelisted"
- Vào Network Access và thêm IP của bạn
- Hoặc dùng 0.0.0.0/0 cho development (không an toàn cho production)

### Lỗi "Connection timeout"
- Kiểm tra internet connection
- Kiểm tra firewall không chặn port 27017 (local) hoặc 27017+ (Atlas)
- Thử ping cluster endpoint

---

## MongoDB Atlas Free Tier Limits
- Storage: 512 MB
- RAM: Shared
- Đủ cho hàng ngàn vé và user
- Perfect cho MVP và testing!

