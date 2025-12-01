# Hướng dẫn Deploy lên Vercel

## Bước 1: Thêm Environment Variables

Trong trang Vercel "New Project", mở section **"Environment Variables"** và thêm:

### Database & Auth
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://yourproject.vercel.app (sẽ cập nhật sau khi deploy)
```

### Google OAuth
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Cloudinary (Upload ảnh)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### SePay
```
SEPAY_MERCHANT_ID=SP-TEST-MQ34336A
SEPAY_SECRET_KEY=spsk_test_yoTckHq7W5cfbEyMA4n6aYNA9FqfWhN5
SEPAY_ENV=sandbox
NEXT_PUBLIC_BASE_URL=https://yourproject.vercel.app (sẽ cập nhật sau khi deploy)
```

## Bước 2: Deploy

1. Bấm nút **"Deploy"** ở dưới cùng
2. Đợi Vercel build và deploy (khoảng 2-5 phút)
3. Sau khi deploy xong, Vercel sẽ cung cấp domain: `passve.vercel.app` (hoặc tên khác)

## Bước 3: Cập nhật Environment Variables

Sau khi có domain từ Vercel:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Cập nhật:
   - `NEXTAUTH_URL=https://passve.vercel.app` (thay bằng domain thực tế)
   - `NEXT_PUBLIC_BASE_URL=https://passve.vercel.app` (thay bằng domain thực tế)
3. Redeploy project để áp dụng thay đổi

## Bước 4: Cấu hình IPN trong SePay

1. Vào https://my.sepay.vn/ → Thông tin tích hợp & cấu hình
2. Phần "Cấu hình IPN nhận thông báo"
3. Nhập URL: `https://passve.vercel.app/api/sepay/webhook` (thay bằng domain thực tế)
4. Bấm "Lưu lại"
5. Bấm "Gửi test" để kiểm tra

## Lưu ý

- Nếu thiếu biến môi trường, app sẽ lỗi khi chạy
- Có thể thêm biến môi trường sau khi deploy xong
- Sau khi thêm/sửa biến môi trường, cần Redeploy để áp dụng



