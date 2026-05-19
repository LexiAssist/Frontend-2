# LexiAssist Frontend Startup Script
# This script starts the Next.js development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LexiAssist Frontend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "[1/3] Checking backend services..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend Gateway is running" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Backend Gateway is not responding at http://localhost:8080" -ForegroundColor Yellow
    Write-Host "Please start backend services first:" -ForegroundColor Yellow
    Write-Host "  cd .." -ForegroundColor Gray
    Write-Host "  .\start-full-stack.ps1" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Check environment configuration
Write-Host "[2/3] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local not found. Creating..." -ForegroundColor Yellow
    @"
# LexiAssist Frontend Environment Configuration
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_AI_PROXY_URL=http://localhost:5005
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_MOCK_MODE=false
DATABASE_URL=postgres://lexiassist:lexiassist_secret@localhost:5432/lexiassist?sslmode=disable
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local exists" -ForegroundColor Green
    
    # Verify critical settings
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_USE_MOCK_API=true") {
        Write-Host "WARNING: Mock API is enabled. Set NEXT_PUBLIC_USE_MOCK_API=false to use real backend" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check dependencies
Write-Host "[3/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Frontend will be available at:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "API Gateway (Backend):" -ForegroundColor White
Write-Host "  http://localhost:8080" -ForegroundColor Gray
Write-Host ""

Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev
