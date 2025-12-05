# Hướng dẫn Seed 100 Vé

## Cách seed 100 vé sau khi deploy:

### Cách 1: Qua Admin Dashboard (Khuyến nghị)
1. Đăng nhập với tài khoản admin
2. Vào `/admin` (Admin Dashboard)
3. Tìm nút **"Seed 100 vé"** ở cuối danh sách Quick Actions
4. Click nút và xác nhận
5. Đợi vài giây để hệ thống tạo 100 vé

### Cách 2: Qua API trực tiếp
```bash
# Gọi API endpoint (phải đăng nhập admin)
POST /api/admin/seed-100-tickets
```

## Thông tin về 100 vé được tạo:

- ✅ **100 vé** với status "approved" (hiển thị ngay)
- ✅ **100 users** khác nhau làm người bán
- ✅ **Mỗi vé có ảnh khác nhau** (từ Picsum Photos)
- ✅ **Mỗi user có avatar khác nhau** (từ UI Avatars)
- ✅ **QR code tự động tạo** cho mỗi vé
- ✅ **Thông tin ngẫu nhiên**: phim, rạp, thành phố, ghế, giá

## Lưu ý:

- Chỉ admin mới có thể seed vé
- Mỗi lần chạy sẽ tạo thêm 100 vé mới (không xóa vé cũ)
- Nếu muốn xóa vé cũ trước khi seed, cần xóa thủ công trong database

