# Hướng dẫn cấu hình SePay khi chưa có domain

## Cách 1: Dùng ngrok (Test local)

### Bước 1: Cài đặt ngrok
1. Tải ngrok: https://ngrok.com/download
2. Giải nén và đặt vào thư mục dễ tìm (ví dụ: `C:\ngrok`)

### Bước 2: Chạy ngrok
```bash
# Mở terminal mới và chạy:
ngrok http 3000
```

### Bước 3: Lấy public URL
- ngrok sẽ hiển thị URL dạng: `https://abc123.ngrok.io`
- Copy URL này

### Bước 4: Cấu hình trong SePay
1. Vào https://my.sepay.vn/ → Thông tin tích hợp & cấu hình
2. Phần "Cấu hình IPN nhận thông báo"
3. Nhập URL: `https://abc123.ngrok.io/api/sepay/webhook`
4. Bấm "Lưu lại"
5. Bấm "Gửi test" để kiểm tra

**Lưu ý:** URL ngrok free sẽ thay đổi mỗi lần restart. Nếu muốn URL cố định, cần đăng ký ngrok account.

---

## Cách 2: Deploy lên Vercel (Khuyến nghị - Miễn phí)

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Add SePay integration"
git push origin main
```

### Bước 2: Deploy lên Vercel
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Import project từ GitHub
4. Deploy (Vercel tự động detect Next.js)

### Bước 3: Lấy domain
- Sau khi deploy xong, Vercel sẽ cung cấp domain: `yourproject.vercel.app`
- Hoặc có thể thêm custom domain sau

### Bước 4: Cấu hình trong SePay
1. Vào https://my.sepay.vn/ → Thông tin tích hợp & cấu hình
2. Phần "Cấu hình IPN nhận thông báo"
3. Nhập URL: `https://yourproject.vercel.app/api/sepay/webhook`
4. Bấm "Lưu lại"
5. Bấm "Gửi test" để kiểm tra

### Bước 5: Cấu hình Environment Variables trong Vercel
Vào Vercel Dashboard → Settings → Environment Variables, thêm:
- `SEPAY_MERCHANT_ID`
- `SEPAY_SECRET_KEY`
- `SEPAY_ENV`
- `NEXT_PUBLIC_BASE_URL` (URL của Vercel)

---

## Cách 3: Dùng Cloudflare Tunnel (Miễn phí, URL cố định)

1. Cài đặt Cloudflare Tunnel
2. Tạo tunnel và lấy URL
3. Cấu hình trong SePay tương tự

---

## Test IPN Webhook

Sau khi cấu hình xong:
1. Bấm "Gửi test" trong SePay Dashboard
2. Kiểm tra logs trong Vercel/Server để xem có nhận được request không
3. Kiểm tra database xem transaction có được cập nhật không

