# Start RumorRadar ML FastAPI Service
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location -Path "$projectRoot\ml-service"

Write-Host "Starting RumorRadar ML Service on http://127.0.0.1:8000..." -ForegroundColor Cyan
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
