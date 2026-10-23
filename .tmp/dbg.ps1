$uri = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=" + [uri]::EscapeDataString("filetype:bitmap waving hand") + "&gsrlimit=10&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=640"
$r = Invoke-RestMethod -Uri $uri -TimeoutSec 60
$r.query.pages.PSObject.Properties.Value | ForEach-Object {
  $ii = $_.imageinfo[0]
  [pscustomobject]@{
    Title = $_.title
    Lic   = $ii.extmetadata.LicenseShortName.value
    W     = $ii.width
    H     = $ii.height
  }
} | Format-Table -AutoSize
