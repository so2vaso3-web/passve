# 🔄 Cập nhật Cloudinary trên Vercel

## ✅ Thông tin Cloudinary đã cấu hình

Bạn đã cấu hình Cloudinary trong `.env.local`, bây giờ cần thêm vào Vercel:

---

## 📋 Các biến cần thêm vào Vercel

Vào **Vercel Dashboard** → **Settings** → **Environment Variables**

Thêm 3 biến sau (chọn **Environment: Production, Preview, Development** cho tất cả):

### 1. Cloudinary Cloud Name
```
Name: CLOUDINARY_CLOUD_NAME
Value: dgabvudwo
```

### 2. Cloudinary API Key
```
Name: CLOUDINARY_API_KEY
Value: 617286788243454
```

### 3. Cloudinary API Secret
```
Name: CLOUDINARY_API_SECRET
Value: oT_ZMBuSncgsLBadQQxIrApTAmY
```

---

## 🚀 Các bước thực hiện

1. **Đăng nhập Vercel**: https://vercel.com
2. **Chọn project** của bạn
3. **Vào Settings** → **Environment Variables**
4. **Thêm từng biến**:
   - Click **"Add New"**
   - Điền Name và Value
   - Chọn **Production, Preview, Development** (tích cả 3)
   - Click **Save**
5. **Lặp lại** cho 3 biến Cloudinary
6. **Redeploy** project:
   - Vào **Deployments**
   - Click vào deployment mới nhất
   - Click **"Redeploy"** (hoặc push code mới lên GitHub)

---

## ✅ Sau khi cập nhật

Sau khi thêm và redeploy, upload ảnh trên production sẽ:
- ✅ Lưu lên Cloudinary (thay vì local)
- ✅ Tải nhanh hơn (CDN)
- ✅ Ổn định hơn

---

## 🧪 Test sau khi deploy

1. Vào https://passve.online
2. Đăng nhập
3. Vào "Đăng bán vé"
4. Upload ảnh vé
5. Kiểm tra ảnh có hiển thị đúng không

---

**💡 Lưu ý**: Sau khi thêm env variables, **LUÔN phải Redeploy** để áp dụng thay đổi!

