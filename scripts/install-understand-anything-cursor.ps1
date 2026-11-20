<#
.SYNOPSIS
  Link Understand-Anything skills into Cursor personal skills folder.

.DESCRIPTION
  Cursor can auto-discover the plugin when you open the Understand-Anything repo
  (.cursor-plugin/plugin.json) or add it via Settings → Plugins.

  This script is for using the nine skills on OTHER projects (e.g. AIAutomation)
  by junctioning them into:
    %USERPROFILE%\.cursor\skills\<skill-name>

.EXAMPLE
  $env:UA_DIR = "C:\path\to\Understand-Anything"
  .\scripts\install-understand-anything-cursor.ps1

.EXAMPLE
  .\scripts\install-understand-anything-cursor.ps1 -Uninstall
#>
param(
  [switch]$Uninstall,
  [string]$UaDir = $env:UA_DIR
)

$ErrorActionPreference = 'Stop'
$skillsTarget = Join-Path $HOME '.cursor\skills'
$defaultRepo = Join-Path $HOME '.understand-anything\repo'

if (-not $UaDir) {
  if (Test-Path (Join-Path $defaultRepo 'understand-anything-plugin\skills')) {
    $UaDir = $defaultRepo
  }
}

$skillsRoot = if ($UaDir) {
  Join-Path $UaDir 'understand-anything-plugin\skills'
} else {
  $null
}

$skillNames = @(
  'understand',
  'understand-dashboard',
  'understand-chat',
  'understand-diff',
  'understand-explain',
  'understand-onboard',
  'understand-domain',
  'understand-knowledge',
  'understand-figma'
)

function New-JunctionSafe([string]$Link, [string]$Source) {
  if (Test-Path $Link) {
    $item = Get-Item $Link -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
      Remove-Item $Link -Force
    } else {
      Write-Warning "Skip $Link (exists and is not a junction)"
      return
    }
  }
  New-Item -ItemType Junction -Path $Link -Target $Source | Out-Null
  Write-Host " OK $Link -> $Source"
}

if ($Uninstall) {
  if (-not (Test-Path $skillsTarget)) {
    Write-Host "Nothing to uninstall at $skillsTarget"
    exit 0
  }
  foreach ($name in $skillNames) {
    $link = Join-Path $skillsTarget $name
    if (Test-Path $link) {
      Remove-Item $link -Force
      Write-Host " Removed $link"
    }
  }
  exit 0
}

if (-not $skillsRoot -or -not (Test-Path $skillsRoot)) {
  Write-Host @"
Understand-Anything skills folder not found.

1) Clone or set UA_DIR:
   git clone https://github.com/Egonex-AI/Understand-Anything.git
   `$env:UA_DIR = "<clone-path>"

2) Re-run:
   .\scripts\install-understand-anything-cursor.ps1

Or use Cursor without junctions:
   - Settings → Plugins → paste https://github.com/Egonex-AI/Understand-Anything
   - Or open the Understand-Anything clone in Cursor (auto-discovery via .cursor-plugin)
"@
  exit 1
}

New-Item -ItemType Directory -Path $skillsTarget -Force | Out-Null
Write-Host "Linking Understand-Anything skills into $skillsTarget"
foreach ($name in $skillNames) {
  $src = Join-Path $skillsRoot $name
  if (-not (Test-Path $src)) {
    Write-Warning "Missing skill folder: $src"
    continue
  }
  New-JunctionSafe (Join-Path $skillsTarget $name) $src
}

Write-Host ""
Write-Host "Done. Restart Cursor / reload window, then open your TARGET project and run: /understand"
Write-Host "Guide: docs\understand-anything-guide.html"
