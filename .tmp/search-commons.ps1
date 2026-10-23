param(
  [string[]]$Queries = @(),
  [int]$Limit = 20
)

$ok = @{}
$rows = @()

foreach ($q in $Queries) {
  $uri = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=" +
    [uri]::EscapeDataString("filetype:bitmap $q") +
    "&gsrlimit=$Limit&prop=imageinfo|categories&iiprop=url|size|extmetadata&iiurlwidth=640&cllimit=20"
  try {
    $r = Invoke-RestMethod -Uri $uri -TimeoutSec 60
  } catch {
    Write-Output "ERR $q : $($_.Exception.Message)"
    continue
  }
  if (-not $r.query) { continue }
  foreach ($p in $r.query.pages.PSObject.Properties.Value) {
    $ii = $p.imageinfo[0]
    if (-not $ii) { continue }
    $lic = $ii.extmetadata.LicenseShortName.value
    if ($lic -notmatch '^(CC0|Public domain|PD)') { continue }
    $cats = ($p.categories | ForEach-Object { $_.title -replace '^Category:', '' }) -join '; '
    $rows += [pscustomobject]@{
      Query   = $q
      Title   = $p.title
      W       = $ii.width
      H       = $ii.height
      License = $lic
      Artist  = ($ii.extmetadata.Artist.value -replace '<[^>]+>', '')
      Page    = $ii.descriptionurl
      Thumb   = $ii.thumburl
      Cats    = $cats
    }
  }
}

$rows | Sort-Object Query, Title | Format-List
