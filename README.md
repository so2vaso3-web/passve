# Pass Vé Phim - Chợ Sang Nhượng Vé Xem Phim & Sự Kiện

Website full-stack mua bán vé phim, vé concert, vé sự kiện với hệ thống escrow tự động, bảo vệ cả người mua và người bán.

## 🚀 Tính năng

- ✅ Đăng bán vé với tích hợp TMDb API
- ✅ Tìm kiếm và lọc vé theo nhiều tiêu chí
- ✅ Chat realtime giữa người mua và người bán
- ✅ Hệ thống escrow tự động (giữ tiền → gửi vé → xác nhận → chuyển tiền)
- ✅ Thanh toán qua Momo/VNPay (sandbox)
- ✅ Upload ảnh vé lên Cloudinary
- ✅ Đánh giá người dùng
- ✅ Admin dashboard để duyệt vé và quản lý
- ✅ Dark mode
- ✅ Responsive mobile-first

## 🛠️ Công nghệ

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB với Mongoose
- **Auth**: NextAuth v5 + Google OAuth
- **Real-time**: Socket.io
- **Storage**: Cloudinary
- **Payment**: Momo/VNPay (sandbox)
- **Deploy**: Vercel + MongoDB Atlas

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <your-repo-url>
cd pass-ve-phim
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env.local` từ `.env.example` và điền các thông tin:

```bash
cp .env.example .env.local
```

**Các biến môi trường cần thiết:**

- `MONGODB_URI`: Connection string từ MongoDB Atlas
- `NEXTAUTH_SECRET`: Random string (dùng `openssl rand -base64 32`)
- `NEXTAUTH_URL`: URL của app (http://localhost:3000 cho dev)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Từ Google Cloud Console
- `CLOUDINARY_*`: Từ Cloudinary dashboard
- `TMDB_API_KEY`: Từ [TMDb](https://www.themoviedb.org/settings/api)

### 4. Chạy database seed (tùy chọn)

Tạo dữ liệu mẫu:

```bash
npm run seed
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 🗄️ Database Schema

### User
- Thông tin người dùng, ví tiền, đánh giá

### Ticket
- Thông tin vé: phim, rạp, ngày giờ, ghế, giá, ảnh
- Status: pending, approved, sold, cancelled, rejected

### Transaction
- Giao dịch mua bán với escrow flow
- Status: pending, paid, confirmed, disputed, completed

### ChatMessage
- Tin nhắn giữa người mua và người bán

### Review
- Đánh giá sau khi hoàn tất giao dịch

## 🔐 Authentication

- **Google OAuth**: Đăng nhập bằng Google
- **Phone OTP**: Sử dụng Firebase Auth (cần cấu hình thêm)

## 💳 Payment Flow (Escrow)

1. Người mua chọn vé và thanh toán qua Momo/VNPay
2. Tiền được giữ trong hệ thống (escrow)
3. Người bán gửi mã vé qua chat
4. Người mua xác nhận "Đã nhận vé"
5. Tiền được chuyển cho người bán (trừ 12% phí platform)
6. Nếu có tranh chấp, admin can thiệp

## 📱 API Routes

- `GET /api/tickets` - Lấy danh sách vé
- `POST /api/tickets` - Tạo vé mới
- `GET /api/tickets/[id]` - Chi tiết vé
- `POST /api/transactions` - Tạo giao dịch
- `GET /api/chat/[ticketId]` - Lấy tin nhắn
- `POST /api/chat/[ticketId]` - Gửi tin nhắn
- `POST /api/admin/tickets/[id]/approve` - Duyệt vé
- `POST /api/admin/tickets/[id]/reject` - Từ chối vé

## 🚀 Deploy lên Vercel

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy trên Vercel

1. Vào [vercel.com](https://vercel.com)
2. Import project từ GitHub
3. Thêm các biến môi trường từ `.env.local`
4. Deploy!

### 3. Cấu hình MongoDB Atlas

1. Tạo cluster trên [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP `0.0.0.0/0` (hoặc IP của Vercel)
3. Lấy connection string và thêm vào Vercel env vars

### 4. Cấu hình Domain (tùy chọn)

- Thêm domain custom trong Vercel dashboard
- Update `NEXTAUTH_URL` trong env vars

## 🔧 Socket.io Server

Để chạy socket server riêng (tùy chọn):

```bash
# Tạo file server.js riêng hoặc tích hợp vào Next.js
```

Hiện tại socket được tích hợp trong Next.js API routes.

## 📝 Notes

- Payment URLs hiện tại là mock/sandbox, cần tích hợp API thật của Momo/VNPay
- Socket.io cần server riêng hoặc dùng Pusher thay thế
- Firebase Auth cho phone OTP cần cấu hình thêm
- Telegram bot notification cần setup thêm

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

MIT

## 👨‍💻 Author

Pass Vé Phim Team

---

Made with ❤️ using Next.js 14

