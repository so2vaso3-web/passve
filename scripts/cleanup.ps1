# Script dọn dẹp process Node.js không cần thiết
Write-Host "Đang dọn dẹp process Node.js..." -ForegroundColor Yellow

# Lấy process ID của dev server (process dùng nhiều RAM nhất)
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
$mainProcess = $nodeProcesses | Sort-Object WorkingSet -Descending | Select-Object -First 1

if ($mainProcess) {
    Write-Host "Giữ lại process chính: PID $($mainProcess.Id) - $([math]::Round($mainProcess.WorkingSet/1MB,2)) MB" -ForegroundColor Green
    
    # Dừng các process khác (nếu có)
    $otherProcesses = $nodeProcesses | Where-Object { $_.Id -ne $mainProcess.Id }
    if ($otherProcesses) {
        Write-Host "Đang dừng $($otherProcesses.Count) process không cần thiết..." -ForegroundColor Yellow
        $otherProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "Đã dọn dẹp xong!" -ForegroundColor Green
    } else {
        Write-Host "Không có process nào cần dọn dẹp." -ForegroundColor Green
    }
} else {
    Write-Host "Không tìm thấy process Node.js nào." -ForegroundColor Yellow
}

Write-Host "`nThông tin process hiện tại:" -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}}, CPU | Format-Table -AutoSize



