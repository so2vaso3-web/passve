# Hướng dẫn xóa file secrets khỏi Git

## ⚠️ QUAN TRỌNG: Các file này chứa thông tin nhạy cảm và đã được thêm vào .gitignore

Các file sau đã được thêm vào .gitignore:
- `VERCEL_*.txt`
- `FACEBOOK_ENV_VARS.txt`
- `*_ENV*.txt`
- `*_SECRET*.txt`
- `*_KEY*.txt`

## Nếu các file này đã được commit vào Git:

### Bước 1: Xóa file khỏi Git (nhưng giữ lại trên máy)
```bash
git rm --cached VERCEL_ENV_COPY_PASTE.txt
git rm --cached FACEBOOK_ENV_VARS.txt
git rm --cached VERCEL_FIREBASE_ENV.txt
git rm --cached VERCEL_MISSING_ENV.txt
```

### Bước 2: Commit thay đổi
```bash
git commit -m "Remove sensitive files from git tracking"
```

### Bước 3: (Tùy chọn) Xóa khỏi Git history hoàn toàn
**CẢNH BÁO**: Chỉ làm nếu bạn chắc chắn và đã backup!

```bash
# Sử dụng git filter-branch (cũ)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch VERCEL_ENV_COPY_PASTE.txt FACEBOOK_ENV_VARS.txt VERCEL_FIREBASE_ENV.txt VERCEL_MISSING_ENV.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Hoặc sử dụng git-filter-repo (khuyến nghị - cần cài đặt)
# pip install git-filter-repo
git filter-repo --path VERCEL_ENV_COPY_PASTE.txt --invert-paths
git filter-repo --path FACEBOOK_ENV_VARS.txt --invert-paths
git filter-repo --path VERCEL_FIREBASE_ENV.txt --invert-paths
git filter-repo --path VERCEL_MISSING_ENV.txt --invert-paths
```

### Bước 4: Force push (CHỈ NẾU BẠN CHẮC CHẮN!)
```bash
git push origin --force --all
git push origin --force --tags
```

## ⚠️ LƯU Ý QUAN TRỌNG:

1. **Thay đổi tất cả secrets** sau khi xóa khỏi git:
   - MongoDB password
   - NEXTAUTH_SECRET
   - SEPAY keys
   - Google OAuth secrets
   - Cloudinary keys
   - Tất cả API keys khác

2. **Thông báo cho team** nếu làm việc nhóm

3. **Backup** trước khi force push

4. **Không bao giờ** commit lại các file này

