# Script tự động cập nhật Google OAuth credentials vào .env.local

Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "CẬP NHẬT GOOGLE OAUTH CREDENTIALS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

# Nhập Client ID
$clientId = Read-Host "Nhập Google Client ID (dạng: xxxxx.apps.googleusercontent.com)"

if ([string]::IsNullOrWhiteSpace($clientId)) {
    Write-Host "❌ Client ID không được để trống!" -ForegroundColor Red
    exit 1
}

# Nhập Client Secret
$clientSecret = Read-Host "Nhập Google Client Secret"

if ([string]::IsNullOrWhiteSpace($clientSecret)) {
    Write-Host "❌ Client Secret không được để trống!" -ForegroundColor Red
    exit 1
}

# Đọc file .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Không tìm thấy file .env.local!" -ForegroundColor Red
    exit 1
}

Write-Host "`nĐang cập nhật file .env.local..." -ForegroundColor Yellow

# Đọc nội dung file
$content = Get-Content $envFile -Raw

# Cập nhật GOOGLE_CLIENT_ID
if ($content -match "GOOGLE_CLIENT_ID=") {
    $content = $content -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$clientId"
} else {
    # Thêm vào cuối file nếu chưa có
    $content += "`nGOOGLE_CLIENT_ID=$clientId"
}

# Cập nhật GOOGLE_CLIENT_SECRET
if ($content -match "GOOGLE_CLIENT_SECRET=") {
    $content = $content -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$clientSecret"
} else {
    # Thêm vào cuối file nếu chưa có
    $content += "`nGOOGLE_CLIENT_SECRET=$clientSecret"
}

# Ghi lại file
$content | Set-Content $envFile -NoNewline

Write-Host "✅ Đã cập nhật thành công!" -ForegroundColor Green
Write-Host "`nĐã cập nhật:" -ForegroundColor Cyan
Write-Host "  GOOGLE_CLIENT_ID=$clientId" -ForegroundColor White
Write-Host "  GOOGLE_CLIENT_SECRET=$($clientSecret.Substring(0, [Math]::Min(10, $clientSecret.Length)))..." -ForegroundColor White
Write-Host "`n💡 Bây giờ restart server: npm run dev`n" -ForegroundColor Yellow

