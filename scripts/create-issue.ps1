# create-issue.ps1 - helper script to create github issues from markdown files
#
# usage: .\scripts\create-issue.ps1 <path-to-draft.md>
# example: .\scripts\create-issue.ps1 scripts\issue-templates\drafts\001-my-feature.md

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueFile
)

# validation
if (-not (Test-Path $IssueFile)) {
    Write-Host "error: file not found: $IssueFile" -ForegroundColor Red
    exit 1
}

# check if gh cli is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "error: github cli (gh) not found" -ForegroundColor Red
    Write-Host "install it from: https://cli.github.com/"
    exit 1
}

# check if authenticated
try {
    gh auth status 2>&1 | Out-Null
} catch {
    Write-Host "error: not authenticated with github" -ForegroundColor Red
    Write-Host "run: gh auth login"
    exit 1
}

# create the issue
Write-Host "creating issue from: $IssueFile" -ForegroundColor Yellow
Write-Host ""

try {
    gh issue create --body-file $IssueFile
    
    Write-Host ""
    Write-Host "✓ issue created successfully" -ForegroundColor Green
    
    # archive the draft
    $ArchiveDir = "scripts\issue-templates\created"
    if (-not (Test-Path $ArchiveDir)) {
        New-Item -ItemType Directory -Path $ArchiveDir | Out-Null
    }
    
    $Filename = Split-Path $IssueFile -Leaf
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $ArchiveName = "${Timestamp}_${Filename}"
    
    Move-Item $IssueFile "$ArchiveDir\$ArchiveName"
    Write-Host "✓ draft archived to: $ArchiveDir\$ArchiveName" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "✗ failed to create issue" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}