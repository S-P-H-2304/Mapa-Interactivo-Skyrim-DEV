$json = Get-Content 'src\.expanse.json' -Encoding UTF8 -Raw | ConvertFrom-Json
$obj = $json.objects.'17f5fc13-2d5a-4289-be68-7d457fa8dd58'
$compKeys = $obj.components.PSObject.Properties | Select-Object -ExpandProperty Name
foreach ($key in $compKeys) {
    if ($key -match "rumorBookManager") {
        Write-Host "RumorBookManager params: $(ConvertTo-Json $obj.components.$key.parameters -Compress)"
    }
}
