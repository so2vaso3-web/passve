# 🔐 Cập nhật Google OAuth cho Production

## Bước 1: Cập nhật trong Google Cloud Console

Vào https://console.cloud.google.com/ → APIs & Services → Credentials

### 1.1. Thêm Authorized JavaScript origins:
- Bấm **"+ Add URI"** trong phần "Authorized JavaScript origins"
- Thêm: `https://passve.online`
- Giữ lại: `http://localhost:3000` (cho dev)

### 1.2. Thêm Authorized redirect URIs:
- Bấm **"+ Add URI"** trong phần "Authorized redirect URIs"
- Thêm: `https://passve.online/api/auth/callback/google`
- Giữ lại: `http://localhost:3000/api/auth/callback/google` (cho dev)

### 1.3. Bấm "Save"

**Lưu ý**: Có thể mất 5 phút đến vài giờ để settings có hiệu lực.

---

## Bước 2: Kiểm tra Vercel Environment Variables

Vào Vercel Dashboard → Settings → Environment Variables

Đảm bảo đã có:
- ✅ `GOOGLE_CLIENT_ID` = `your-google-client-id.apps.googleusercontent.com` (lấy từ Google Cloud Console)
- ✅ `GOOGLE_CLIENT_SECRET` = `your-google-client-secret` (lấy từ Google Cloud Console)

Nếu chưa có, thêm vào (chọn Environment: Production, Preview, Development).

---

## Bước 3: Redeploy

Sau khi cập nhật:
1. Vào Vercel → Deployments
2. Bấm **Redeploy** (hoặc push code mới lên GitHub)

---

## Bước 4: Test

1. Vào https://passve.online
2. Bấm "Đăng nhập"
3. Chọn "Đăng nhập với Google"
4. Kiểm tra xem có redirect về đúng không

---

## ✅ Checklist

- [ ] Đã thêm `https://passve.online` vào Authorized JavaScript origins
- [ ] Đã thêm `https://passve.online/api/auth/callback/google` vào Authorized redirect URIs
- [ ] Đã bấm "Save" trong Google Cloud Console
- [ ] Đã thêm `GOOGLE_CLIENT_ID` vào Vercel
- [ ] Đã thêm `GOOGLE_CLIENT_SECRET` vào Vercel
- [ ] Đã redeploy trên Vercel
- [ ] Đã test đăng nhập Google trên production

---

**💡 Tip**: Có thể mất vài phút để Google OAuth settings có hiệu lực. Nếu test ngay không được, đợi 5-10 phút rồi thử lại.

