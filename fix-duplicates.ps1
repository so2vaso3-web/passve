# Script to fix duplicate code in files
$files = Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = $content -split "`n"
    
    # Find duplicate imports
    $importLines = @()
    $seenImports = @{}
    $duplicateStart = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()
        if ($line -match "^import\s+.*from") {
            $importKey = $line
            if ($seenImports.ContainsKey($importKey)) {
                # Found duplicate import
                if ($duplicateStart -eq -1) {
                    $duplicateStart = $i
                }
            } else {
                $seenImports[$importKey] = $true
                if ($duplicateStart -ne -1) {
                    # We found a duplicate section, keep everything before it
                    break
                }
            }
        } elseif ($line -match "^export\s+(default\s+)?(function|const|class|async\s+function)" -and $duplicateStart -ne -1) {
            # Found another export after duplicate imports - this is likely the start of duplicate code
            break
        }
    }
    
    if ($duplicateStart -gt 0) {
        # Remove duplicate section
        $newContent = ($lines[0..($duplicateStart-1)] -join "`n").Trim()
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done fixing duplicates!"




