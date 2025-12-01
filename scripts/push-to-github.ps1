# Script để push code lên GitHub
# Chạy: powershell -ExecutionPolicy Bypass -File scripts/push-to-github.ps1

Write-Host "`n🚀 PUSH CODE LÊN GITHUB`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Yellow

# Kiểm tra git đã được cài đặt chưa
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Tải Git tại: https://git-scm.com/download/win`n" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra đã có .git chưa
if (-not (Test-Path .git)) {
    Write-Host "📦 Khởi tạo git repository...`n" -ForegroundColor Yellow
    git init
    git branch -M main
}

# Kiểm tra remote đã có chưa
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ Đã có remote: $remoteUrl`n" -ForegroundColor Green
} else {
    Write-Host "⚠️ Chưa có remote repository!`n" -ForegroundColor Yellow
    Write-Host "Vui lòng:" -ForegroundColor Cyan
    Write-Host "1. Tạo repository tại: https://github.com/new" -ForegroundColor White
    Write-Host "2. Copy URL repository (ví dụ: https://github.com/username/pass-ve-phim.git)" -ForegroundColor White
    Write-Host "3. Chạy lệnh: git remote add origin YOUR_REPO_URL`n" -ForegroundColor White
    exit 1
}

# Add và commit
Write-Host "📝 Đang add files...`n" -ForegroundColor Yellow
git add .

Write-Host "💾 Đang commit...`n" -ForegroundColor Yellow
$commitMessage = Read-Host "Nhập commit message (hoặc Enter để dùng 'Update code')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update code"
}
git commit -m $commitMessage

# Push
Write-Host "`n🚀 Đang push lên GitHub...`n" -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅✅✅ PUSH THÀNH CÔNG! ✅✅✅`n" -ForegroundColor Green
    Write-Host "Bây giờ bạn có thể deploy lên Vercel!`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Có lỗi xảy ra khi push!`n" -ForegroundColor Red
}



