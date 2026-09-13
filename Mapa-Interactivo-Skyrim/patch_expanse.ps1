$json = Get-Content 'src\.expanse.json' -Encoding UTF8 -Raw | ConvertFrom-Json

# 1. Rename UI Rumor Túmulo to UI Rumor Universal
$universalPanelId = '17f5fc13-2d5a-4289-be68-7d457fa8dd58'
$json.objects.$universalPanelId.name = "UI Rumor Universal"

# 2. Add rumorBookManager component to the panel
# Let's create the component object
$comp = @{
    id = "rumorBookManager_$([guid]::NewGuid().ToString())"
    name = "rumorBookManager"
    parameters = @{
        leftText = @{ type = "entity"; id = "4a108548-215b-4eda-91e0-9e7aa4751b46" }
        rightText = @{ type = "entity"; id = "c0cd9611-1fbd-41ef-98af-298b1cd41382" }
        leftButton = @{ type = "entity"; id = "98332f69-8468-43b4-8f1d-7758ef349921" }
        rightButton = @{ type = "entity"; id = "eec94ae1-1cd0-4b1f-8d70-bb26ccc882c1" }
        nextSpreadBtn = @{ type = "entity"; id = "f53ae908-4df8-4b48-b1e7-5d1a98ea3a38" }
        prevSpreadBtn = @{ type = "entity"; id = "8b6aa4a8-1876-48e0-8715-c533df3ca1e8" }
    }
}
$json.objects.$universalPanelId.components = $json.objects.$universalPanelId.components | Add-Member -MemberType NoteProperty -Name $comp.id -Value $comp -PassThru

# Save modified json back. BUT wait, ConvertTo-Json in PS 5.1 messes up format.
# Let's not use ConvertTo-Json. Let's do it via regex or node... wait. 
