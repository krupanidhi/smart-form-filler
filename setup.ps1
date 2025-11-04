# Smart Form Filler Setup Script for Windows

Write-Host "🤖 Smart Form Filler Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Install Playwright browsers
Write-Host ""
Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install chromium

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install browsers" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Browsers installed" -ForegroundColor Green

# Create screenshots directory
Write-Host ""
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "screenshots" | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green

# Copy .env.example to .env if not exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created (optional: add OpenAI API key)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run demo: npm run demo" -ForegroundColor White
Write-Host "2. Try examples: node examples/simple-usage.js" -ForegroundColor White
Write-Host "3. Read QUICKSTART.md for more info" -ForegroundColor White
Write-Host ""
