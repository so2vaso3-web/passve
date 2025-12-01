# 🌐 Hướng dẫn thêm Custom Domain trên Vercel

## 📋 Bước 1: Chuẩn bị Domain

Bạn cần có một domain đã mua từ nhà cung cấp (như Namecheap, GoDaddy, Cloudflare, v.v.)

**Ví dụ**: `passve.online`, `passve.com`, `passve.vn`

---

## 🔧 Bước 2: Vào Vercel Dashboard

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn **Project** của bạn (ví dụ: `passve`)

---

## ➕ Bước 3: Thêm Domain

1. Vào tab **Settings** (ở thanh menu trên)
2. Scroll xuống phần **Domains**
3. Click nút **Add Domain** hoặc **Add** 
4. Nhập domain của bạn (ví dụ: `passve.online`)
5. Click **Add**

---

## ⚙️ Bước 4: Cấu hình DNS

Sau khi thêm domain, Vercel sẽ hiển thị **DNS Configuration** với các record cần thêm.

### Trường hợp 1: Domain Root (example.com)

Vercel sẽ yêu cầu thêm **A Record** hoặc **CNAME Record**:

**Cách 1: Dùng A Record (Khuyến nghị)**
```
Type: A
Name: @ (hoặc để trống, hoặc domain gốc)
Value: 76.76.21.21
TTL: Auto (hoặc 3600)
```

**Cách 2: Dùng CNAME Record**
```
Type: CNAME  
Name: @ (hoặc domain gốc)
Value: cname.vercel-dns.com
TTL: Auto (hoặc 3600)
```

**⚠️ Lưu ý**: 
- Một số nhà cung cấp không hỗ trợ CNAME cho domain root (`@`)
- Nếu không được, dùng A Record với IP: `76.76.21.21`

### Trường hợp 2: Subdomain (www.example.com)

Thêm **CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (hoặc 3600)
```

---

## 📝 Bước 5: Thêm DNS Records vào Domain Provider

### Namecheap

1. Đăng nhập vào [Namecheap](https://www.namecheap.com/)
2. Vào **Domain List** → Click **Manage** bên cạnh domain
3. Vào tab **Advanced DNS**
4. Click **Add New Record**
5. Thêm A Record hoặc CNAME Record như Vercel hướng dẫn
6. Click **Save All Changes** (dấu tick màu xanh)

### GoDaddy

1. Đăng nhập vào [GoDaddy](https://www.godaddy.com/)
2. Vào **My Products** → Click **DNS** bên cạnh domain
3. Scroll xuống phần **Records**
4. Click **Add** để thêm record mới
5. Chọn **Type**: A hoặc CNAME
6. Điền **Name**, **Value**, **TTL**
7. Click **Save**

### Cloudflare

1. Đăng nhập vào [Cloudflare](https://dash.cloudflare.com/)
2. Chọn domain
3. Vào tab **DNS** → **Records**
4. Click **Add record**
5. Chọn **Type**: A hoặc CNAME
6. Điền **Name**, **IPv4 address** (cho A) hoặc **Target** (cho CNAME)
7. Click **Save**

### Google Domains / Squarespace Domains

1. Đăng nhập vào domain provider
2. Vào **DNS Settings** hoặc **Custom Records**
3. Thêm record mới theo hướng dẫn của Vercel
4. Save changes

---

## ⏱️ Bước 6: Chờ DNS Propagate

Sau khi thêm DNS records:

- **Thời gian chờ**: 5 phút - 24 giờ (thường là 15-30 phút)
- Vercel sẽ tự động detect khi DNS đã được cấu hình đúng
- Bạn sẽ thấy status chuyển từ **Pending** → **Valid Configuration** → **Valid**

**Kiểm tra DNS propagation**:
- Vào [whatsmydns.net](https://www.whatsmydns.net/)
- Nhập domain của bạn
- Kiểm tra xem A Record hoặc CNAME Record đã trỏ đúng chưa

---

## ✅ Bước 7: Verify Domain trên Vercel

1. Quay lại Vercel Dashboard → **Settings** → **Domains**
2. Nếu DNS đã được cấu hình đúng, bạn sẽ thấy:
   - ✅ Status: **Valid Configuration**
   - 🌐 Domain: `passve.online`
   - 🔒 SSL: **Provisioning** (sau đó chuyển thành **Valid**)

**Lưu ý**: SSL certificate (HTTPS) sẽ được Vercel tự động cấp phát miễn phí trong vài phút.

---

## 🔄 Bước 8: Cập nhật Environment Variables

Sau khi domain đã được verify, cần cập nhật các biến môi trường trong Vercel:

1. Vào **Settings** → **Environment Variables**
2. Cập nhật các biến sau:

```env
NEXTAUTH_URL=https://passve.online
NEXT_PUBLIC_BASE_URL=https://passve.online
NEXT_PUBLIC_APP_URL=https://passve.online
NEXT_PUBLIC_SOCKET_URL=https://passve.online
```

3. **Quan trọng**: Chọn **Production**, **Preview**, và **Development** cho tất cả các biến
4. Click **Save**
5. **Redeploy** project để áp dụng thay đổi:
   - Vào tab **Deployments**
   - Click **⋯** (3 chấm) bên cạnh deployment mới nhất
   - Click **Redeploy**

---

## 🔐 Bước 9: Cập nhật OAuth Redirect URIs

Sau khi có domain mới, cần cập nhật redirect URIs trong:

### Google OAuth

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click vào OAuth 2.0 Client ID
4. Cập nhật **Authorized redirect URIs**:
   ```
   https://passve.online/api/auth/callback/google
   ```
5. Click **Save**

### Facebook OAuth

1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Chọn App của bạn
3. **Facebook Login** → **Settings**
4. Cập nhật **Valid OAuth Redirect URIs**:
   ```
   https://passve.online/api/auth/callback/facebook
   ```
5. Cập nhật **Site URL**:
   ```
   https://passve.online
   ```
6. Click **Save Changes**

---

## 🌍 Bước 10: Thêm WWW Subdomain (Tùy chọn)

Nếu muốn hỗ trợ cả `www.passve.online`:

1. Vào **Settings** → **Domains** trên Vercel
2. Click **Add Domain**
3. Nhập: `www.passve.online`
4. Vercel sẽ tự động redirect từ `www` → root domain
5. Hoặc bạn có thể giữ cả 2 domain

**Lưu ý**: Nếu muốn redirect `www` → root, Vercel tự động làm điều này.

---

## 🔍 Kiểm tra Domain hoạt động

1. Mở trình duyệt
2. Truy cập: `https://passve.online`
3. Nếu website hiển thị bình thường → ✅ Thành công!
4. Kiểm tra SSL: URL phải có 🔒 và `https://`

---

## ❌ Troubleshooting

### Domain vẫn hiển thị "Pending Configuration"

- **Kiểm tra DNS records**: Đảm bảo đã thêm đúng A Record hoặc CNAME
- **Đợi thêm thời gian**: DNS có thể mất tới 24 giờ để propagate
- **Xóa cache DNS**: 
  ```bash
  # Windows
  ipconfig /flushdns
  
  # Mac/Linux
  sudo dscacheutil -flushcache
  ```

### SSL Certificate chưa được cấp

- **Đợi thêm vài phút**: Vercel tự động cấp SSL, có thể mất 5-15 phút
- **Kiểm tra DNS**: Đảm bảo DNS đã trỏ đúng
- **Redeploy project**: Đôi khi cần redeploy để trigger SSL provisioning

### Website không load sau khi thêm domain

- **Kiểm tra Environment Variables**: Đảm bảo đã cập nhật `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`
- **Redeploy**: Redeploy project để áp dụng thay đổi
- **Kiểm tra DNS**: Dùng [whatsmydns.net](https://www.whatsmydns.net/) để verify

### Redirect loop hoặc lỗi OAuth

- **Cập nhật OAuth Redirect URIs**: Đảm bảo đã cập nhật trong Google/Facebook console
- **Clear browser cache**: Xóa cache và cookies
- **Kiểm tra NEXTAUTH_URL**: Phải khớp với domain đang dùng

---

## 📚 Tài liệu tham khảo

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel DNS Configuration](https://vercel.com/docs/concepts/projects/domains/add-a-domain)

---

## ✅ Checklist

Sau khi hoàn thành, bạn nên có:

- [ ] Domain đã được thêm vào Vercel
- [ ] DNS records đã được cấu hình đúng
- [ ] Domain status: **Valid**
- [ ] SSL certificate: **Valid**
- [ ] Environment variables đã được cập nhật
- [ ] Google OAuth redirect URI đã được cập nhật
- [ ] Facebook OAuth redirect URI đã được cập nhật
- [ ] Website hoạt động trên domain mới
- [ ] HTTPS hoạt động bình thường

---

**🎉 Chúc mừng! Domain của bạn đã được cấu hình thành công trên Vercel!**

