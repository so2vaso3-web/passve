# ⚡ Tối ưu hiệu năng - Performance Optimizations

## ✅ Đã tối ưu:

### 1. **Homepage (app/page.tsx)**
- ✅ Thêm cache 60 giây: `revalidate = 60`
- ✅ Giảm database timeout từ 10s xuống 5s: `maxTimeMS(5000)`
- ✅ Sử dụng `lean()` để giảm memory usage

### 2. **Profile Page (app/profile/page.tsx)**
- ✅ Thêm loading skeleton thay vì "Đang tải..."
- ✅ Load tất cả data song song với `Promise.all()`
- ✅ Thêm error handling tốt hơn

### 3. **API Tickets (app/api/tickets/route.ts)**
- ✅ Thêm cache 30 giây: `revalidate = 30`
- ✅ Thêm timeout 5 giây: `maxTimeMS(5000)`

### 4. **Loading Components**
- ✅ Cập nhật `app/loading.tsx` với dark theme
- ✅ Thêm skeleton loading cho profile page

---

## 🚀 Các tối ưu tiếp theo (nếu cần):

### 1. **Database Indexes**
Thêm indexes cho các queries thường dùng:
```javascript
// models/Ticket.ts
TicketSchema.index({ status: 1, isExpired: 1, expireAt: 1 });
TicketSchema.index({ seller: 1, status: 1 });
TicketSchema.index({ city: 1, category: 1 });
```

### 2. **Image Optimization**
- Sử dụng Next.js Image component với `priority` cho images trên fold
- Thêm `loading="lazy"` cho images dưới fold
- Sử dụng WebP format

### 3. **API Response Caching**
- Thêm `Cache-Control` headers cho API responses
- Sử dụng Redis cho caching (nếu cần scale)

### 4. **Code Splitting**
- Lazy load components không cần thiết ngay
- Dynamic imports cho heavy components

### 5. **Database Connection Pooling**
- Kiểm tra MongoDB connection pool settings
- Sử dụng connection pooling hiệu quả

---

## 📊 Monitoring

Để theo dõi performance:
1. **Vercel Analytics**: Xem trong Vercel Dashboard
2. **Lighthouse**: Test với Chrome DevTools
3. **Database Queries**: Monitor slow queries trong MongoDB Atlas

---

## 🔍 Debugging

Nếu vẫn còn chậm:
1. Kiểm tra database connection (MongoDB Atlas)
2. Kiểm tra network latency
3. Kiểm tra Vercel function execution time
4. Kiểm tra image sizes và optimization

---

**💡 Tip**: Luôn test performance sau mỗi thay đổi!



