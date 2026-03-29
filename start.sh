#!/bin/bash

# AR Organic Cashbook - Node.js Upgrade & Start Script

echo "=========================================="
echo "🍄 AR Organic Cashbook - Setup Helper"
echo "=========================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "Current Node.js version: $(node -v)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo ""
    echo "❌ Node.js 18.x is too old!"
    echo "✅ Vite requires Node.js 20.19+ or 22.12+"
    echo ""
    echo "=========================================="
    echo "OPTION 1: Using Homebrew (RECOMMENDED)"
    echo "=========================================="
    echo "Run these commands:"
    echo ""
    echo "  brew update"
    echo "  brew upgrade node"
    echo "  node --version"
    echo ""
    echo "=========================================="
    echo "OPTION 2: Using NVM"
    echo "=========================================="
    echo "If you don't have nvm, install it first:"
    echo ""
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    echo "Then run:"
    echo ""
    echo "  nvm install 22"
    echo "  nvm use 22"
    echo "  nvm alias default 22"
    echo "  node --version"
    echo ""
    echo "=========================================="
    echo "OPTION 3: Direct Download"
    echo "=========================================="
    echo "Visit: https://nodejs.org/ (Download LTS v22 or v20)"
    echo ""
    echo "After upgrading, close this terminal and restart it!"
    exit 1
else
    echo "✅ Node.js version is compatible!"
    echo ""
    echo "Starting development server..."
    echo ""
    npm run dev
fi
