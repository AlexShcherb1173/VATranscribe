$ErrorActionPreference = "Stop"

$ProjectRoot = "D:\DevProject\PythonProject\VATranscribe"
$SqlFile = Join-Path $ProjectRoot "fix-large-upload-bigint.sql"

if (-not (Test-Path $SqlFile)) {
    throw "SQL file not found: $SqlFile"
}

Write-Host "Checking Docker Compose services..."
Set-Location $ProjectRoot

docker compose ps

Write-Host ""
Write-Host "Applying BIGINT migration for large uploads..."
Get-Content $SqlFile | docker compose exec -T db psql -U postgres -d vatranscribe

Write-Host ""
Write-Host "Verifying media_assets.size_bytes type..."
docker compose exec -T db psql -U postgres -d vatranscribe -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('media_assets','export_artifacts','user_quotas','usage_snapshots','plans') AND column_name IN ('size_bytes','storage_bytes_used','storage_bytes_limit') ORDER BY table_name, column_name;"

Write-Host ""
Write-Host "Done. Restart API and worker if they are running from old code/image."
Write-Host "Recommended:"
Write-Host "docker compose restart api worker"
