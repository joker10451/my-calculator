param(
  [Parameter(Mandatory = $true)]
  [string]$Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-GzipText([string]$gzipPath) {
  $fs = [IO.File]::OpenRead($gzipPath)
  try {
    $gz = New-Object IO.Compression.GZipStream($fs, [IO.Compression.CompressionMode]::Decompress)
    try {
      $sr = New-Object IO.StreamReader($gz, [Text.Encoding]::UTF8, $true)
      try { return $sr.ReadToEnd() } finally { $sr.Close() }
    } finally { $gz.Close() }
  } finally { $fs.Close() }
}

$text = Read-GzipText -gzipPath $Path
if ([string]::IsNullOrWhiteSpace($text)) {
  Write-Output 'CSV empty'
  exit 1
}

$firstLine = ($text -split "\n", 2)[0].TrimEnd("`r")
$comma = ($firstLine -split ",").Count
$semi = ($firstLine -split ";").Count
$tab = ($firstLine -split "`t").Count

$delim = ","
if ($semi -gt $comma -and $semi -ge $tab) { $delim = ";" }
elseif ($tab -gt $comma -and $tab -gt $semi) { $delim = "`t" }

$rows = $text | ConvertFrom-Csv -Delimiter $delim
if (-not $rows -or $rows.Count -eq 0) {
  Write-Output 'CSV parsed but has no rows'
  exit 1
}

$cols = $rows[0].PSObject.Properties.Name

function Pick([string[]]$keys) {
  foreach ($k in $keys) {
    foreach ($c in $cols) {
      if (($c.ToLower()).Contains($k)) { return $c }
    }
  }
  return $null
}

$colUrl = Pick @('url', 'адрес', 'страниц')
$colStatus = Pick @('status', 'статус', 'код')
$colReason = Pick @('reason', 'причин', 'исключ', 'problem', 'ошиб')

$stat = @{}
$reas = @{}
$top = @{}
$redirectLike = 0
$noSlash = 0

foreach ($r in $rows) {
  $u = if ($colUrl) { ("$($r.$colUrl)").Trim() } else { "" }
  $s = if ($colStatus) { ("$($r.$colStatus)").Trim() } else { "" }
  $re = if ($colReason) { ("$($r.$colReason)").Trim() } else { "" }

  if ($s) { if ($stat.ContainsKey($s)) { $stat[$s]++ } else { $stat[$s] = 1 } }
  if ($re) { if ($reas.ContainsKey($re)) { $reas[$re]++ } else { $reas[$re] = 1 } }
  if ($u) { if ($top.ContainsKey($u)) { $top[$u]++ } else { $top[$u] = 1 } }

  if ($u -match '/(blog|calculator|all|about|contacts|category)/[^\?]*[^/]$') { $noSlash++ }
  $mix = ($s + " " + $re).ToLower()
  if ($mix -match 'редирект|redirect|\b301\b|\b302\b') { $redirectLike++ }
}

Write-Output ("Rows: {0}" -f $rows.Count)
$delimLabel = $delim
if ($delim -eq "`t") { $delimLabel = "TAB" }
Write-Output ("Delimiter: {0}" -f $delimLabel)
Write-Output ("Columns: {0}" -f ($cols -join ", "))
Write-Output ("Detected: url={0}; status={1}; reason={2}" -f $colUrl, $colStatus, $colReason)

Write-Output "Top statuses:"
$stat.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | ForEach-Object {
  Write-Output ("- {0}: {1}" -f $_.Key, $_.Value)
}

Write-Output "Top reasons:"
$reas.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20 | ForEach-Object {
  Write-Output ("- {0}: {1}" -f $_.Key, $_.Value)
}

Write-Output ("Signals: redirect_like_rows={0}; urls_missing_trailing_slash_like={1}" -f $redirectLike, $noSlash)

Write-Output "Most frequent URLs:"
$top.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20 | ForEach-Object {
  Write-Output ("- {0} ({1})" -f $_.Key, $_.Value)
}

