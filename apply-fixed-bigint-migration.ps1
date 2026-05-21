$ErrorActionPreference = "Stop"

$ProjectRoot = "D:\DevProject\PythonProject\VATranscribe"
$MigrationSource = Join-Path $PSScriptRoot "alembic\versions\20260519_0001_bigint_file_sizes.py"
$MigrationTarget = Join-Path $ProjectRoot "alembic\versions\20260519_0001_bigint_file_sizes.py"

if (-not (Test-Path $MigrationSource)) {
    throw "Migration source not found: $MigrationSource"
}

if (-not (Test-Path (Split-Path $MigrationTarget -Parent))) {
    throw "Target alembic versions folder not found: $(Split-Path $MigrationTarget -Parent)"
}

Write-Host "Copy fixed migration..."
Copy-Item $MigrationSource $MigrationTarget -Force

Set-Location $ProjectRoot

Write-Host "Restart API/worker to make sure container sees mounted file..."
docker compose restart api worker

Write-Host "Apply Alembic migrations..."
docker compose exec api alembic upgrade head

Write-Host "Verify tables..."
docker compose exec -T db psql -U postgres -d vatranscribe -c "\dt"

Write-Host "Verify media_assets.size_bytes type..."
docker compose exec -T db psql -U postgres -d vatranscribe -c "\d media_assets"

Write-Host "Done."
