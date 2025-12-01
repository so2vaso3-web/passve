# 🚀 Hướng dẫn cấu hình SePay - Nạp tiền tự động

## 📋 Bước 1: Đăng ký tài khoản SePay

1. **Test/Sandbox**: Vào https://my.dev.sepay.vn/ (môi trường test)
2. **Production**: Vào https://my.sepay.vn/ (môi trường thật)
3. Đăng ký tài khoản và xác thực

---

## 🔑 Bước 2: Lấy API Credentials

1. Đăng nhập vào SePay Dashboard
2. Vào **"Thông tin tích hợp & cấu hình"** hoặc **"API"**
3. Copy các thông tin sau:
   - **Merchant ID**: Dạng `SP-TEST-XXXXXXXX` (sandbox) hoặc `SP-XXXXXXXX` (production)
   - **Secret Key**: Dạng `spsk_test_xxxxxxxxxx` (sandbox) hoặc `spsk_xxxxxxxxxx` (production)
   - **API Token**: (Nếu có)

4. Mở file `.env.local` và điền:
```env
SEPAY_MERCHANT_ID=SP-TEST-XXXXXXXX
SEPAY_SECRET_KEY=spsk_test_xxxxxxxxxx
SEPAY_ENV=sandbox
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🔗 Bước 3: Cấu hình Webhook URL (IPN)

Webhook URL là endpoint để SePay gửi thông báo khi có giao dịch thành công.

### Cách 1: Dùng ngrok (Test local - Miễn phí)

1. **Tải ngrok**: https://ngrok.com/download
2. **Giải nén** và chạy:
```bash
ngrok http 3000
```

3. **Copy URL** ngrok hiển thị (ví dụ: `https://abc123.ngrok.io`)
4. **Vào SePay Dashboard** → **"Tích hợp WebHooks"** hoặc **"Cấu hình IPN"**
5. **Thêm Webhook mới**:
   - **Đặt tên**: `Pass Ve Phim Webhook`
   - **Chọn sự kiện**: `Có tiền vào` hoặc `Giao dịch thành công`
   - **Gọi đến URL**: `https://abc123.ngrok.io/api/sepay/webhook`
   - **Cấu hình chứng thực**: Chọn `API Key` hoặc `OAuth 2.0` (tùy SePay hỗ trợ)
6. **Bấm "Thêm"** và **"Gửi test"** để kiểm tra

**⚠️ Lưu ý**: URL ngrok free sẽ thay đổi mỗi lần restart. Nếu muốn URL cố định, cần đăng ký ngrok account (có phí).

---

### Cách 2: Deploy lên Vercel (Khuyến nghị - Miễn phí, URL cố định)

1. **Push code lên GitHub**:
```bash
git add .
git commit -m "Add SePay integration"
git push origin main
```

2. **Deploy lên Vercel**:
   - Vào https://vercel.com
   - Đăng nhập bằng GitHub
   - Import project từ GitHub
   - Deploy (Vercel tự động detect Next.js)

3. **Lấy domain**:
   - Sau khi deploy, Vercel cung cấp: `yourproject.vercel.app`
   - Hoặc thêm custom domain sau

4. **Cấu hình Environment Variables trong Vercel**:
   - Vào **Settings** → **Environment Variables**
   - Thêm các biến:
     - `SEPAY_MERCHANT_ID`
     - `SEPAY_SECRET_KEY`
     - `SEPAY_ENV` (sandbox hoặc production)
     - `NEXT_PUBLIC_BASE_URL` (URL của Vercel: `https://yourproject.vercel.app`)
     - `MONGODB_URI`
     - `NEXTAUTH_URL` (URL của Vercel)
     - `NEXTAUTH_SECRET`
     - Các biến khác (Google OAuth, Cloudinary, etc.)

5. **Redeploy** để áp dụng env variables

6. **Cấu hình Webhook trong SePay**:
   - Vào SePay Dashboard → **"Tích hợp WebHooks"**
   - **Gọi đến URL**: `https://yourproject.vercel.app/api/sepay/webhook`
   - **Bấm "Lưu lại"** và **"Gửi test"**

---

## ✅ Bước 4: Test nạp tiền

1. **Khởi động server**:
```bash
npm run dev
```

2. **Mở trình duyệt**: http://localhost:3000
3. **Đăng nhập** và vào **"Ví của tôi"**
4. **Bấm "Nạp tiền"**
5. **Nhập số tiền** (tối thiểu 10,000 VNĐ)
6. **Bấm "Nạp tiền"** → Sẽ redirect đến SePay checkout
7. **Thanh toán** (trong sandbox có thể dùng thẻ test)
8. **Kiểm tra**:
   - Ví có được cộng tiền không?
   - Transaction có status "completed" không?
   - Webhook có nhận được callback không?

---

## 🔍 Bước 5: Kiểm tra logs

### Local (ngrok):
- Xem logs trong terminal chạy `npm run dev`
- Xem logs trong terminal chạy `ngrok http 3000` (tab "Inspect")

### Vercel:
- Vào **Vercel Dashboard** → **Deployments** → Click vào deployment → **Functions** → Xem logs

### Database:
- Kiểm tra collection `transactions` trong MongoDB
- Kiểm tra collection `wallets` trong MongoDB

---

## 🐛 Troubleshooting

### Lỗi: "SePay chưa được cấu hình"
- Kiểm tra `.env.local` có đầy đủ `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY` không
- Restart server sau khi thêm env variables

### Webhook không nhận được callback
- Kiểm tra URL webhook trong SePay có đúng không
- Kiểm tra server có đang chạy không (local) hoặc Vercel có deploy thành công không
- Bấm "Gửi test" trong SePay Dashboard để test webhook
- Xem logs trong server/Vercel

### Transaction không được cộng tiền
- Kiểm tra webhook có nhận được request không
- Kiểm tra `status` trong webhook callback có phải `success`/`completed`/`paid` không
- Kiểm tra `order_invoice_number` hoặc `transaction_id` có match với transaction trong DB không
- Xem logs trong server để debug

### Lỗi signature verification
- Hiện tại code chưa verify signature (TODO)
- Có thể bỏ qua trong môi trường test
- Khi production, cần implement signature verification theo docs SePay

---

## 📚 Tài liệu tham khảo

- **SePay Developer Docs**: https://developer.sepay.vn/
- **SePay Webhook Docs**: https://docs.sepay.vn/tich-hop-webhooks.html
- **SePay Dashboard**: https://my.sepay.vn/ (production) hoặc https://my.dev.sepay.vn/ (sandbox)

---

## 🎯 Checklist hoàn thành

- [ ] Đăng ký tài khoản SePay (sandbox hoặc production)
- [ ] Lấy Merchant ID và Secret Key
- [ ] Thêm vào `.env.local` (local) hoặc Vercel Environment Variables (production)
- [ ] Cấu hình Webhook URL (ngrok hoặc Vercel)
- [ ] Test nạp tiền thành công
- [ ] Kiểm tra webhook nhận được callback
- [ ] Kiểm tra ví được cộng tiền tự động
- [ ] (Production) Chuyển sang môi trường production và cấu hình lại

---

**💡 Tip**: Bắt đầu với **sandbox** để test, sau đó chuyển sang **production** khi đã ổn định!

