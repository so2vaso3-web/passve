# Script to fix all duplicate code in files
$files = Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "\.next" -and
    $_.FullName -notmatch "fix-.*\.ps1"
}

$fixedCount = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $totalLines = $lines.Count
    
    # Find duplicate patterns: look for repeated imports or exports
    $seenImports = @{}
    $duplicateStart = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()
        
        # Check for duplicate imports
        if ($line -match "^import\s+.*from") {
            $importKey = $line
            if ($seenImports.ContainsKey($importKey)) {
                # Found duplicate import - mark start of duplicate section
                if ($duplicateStart -eq -1) {
                    $duplicateStart = $i
                }
            } else {
                $seenImports[$importKey] = $true
            }
        }
        
        # Check for duplicate exports/functions after we found duplicate imports
        if ($duplicateStart -ne -1 -and $line -match "^(export\s+(default\s+)?(function|const|class|async\s+function)|const\s+\w+\s*=\s*(new\s+)?(Schema|Model))") {
            # This is likely the start of duplicate code block
            break
        }
    }
    
    # If we found duplicate, remove everything from duplicateStart to end
    if ($duplicateStart -gt 0) {
        $newLines = $lines[0..($duplicateStart-1)]
        $newContent = ($newLines -join "`n").Trim()
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Fixed: $($file.Name) (removed lines $($duplicateStart+1) to $totalLines)"
        $fixedCount++
    }
}

Write-Host "`nDone! Fixed $fixedCount files."




