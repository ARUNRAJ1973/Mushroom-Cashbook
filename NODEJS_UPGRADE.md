# ⚠️ Node.js Upgrade Required

Your current Node.js version is **18.19.1**, but Vite requires **20.19+** or **22.12+**.

## 🔧 How to Upgrade Node.js

### Option 1: Using Homebrew (Recommended for macOS)

```bash
# Update Homebrew
brew update

# Upgrade Node.js to the latest version
brew upgrade node

# Verify the new version
node --version
```

### Option 2: Using NVM (Node Version Manager)

If you don't have nvm installed:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Close and reopen your terminal, then install Node.js 22 (LTS)
nvm install 22
nvm use 22

# Verify
node --version  # Should show v22.x.x or higher
```

If you already have nvm:
```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### Option 3: Direct Download

Visit https://nodejs.org/ and download the LTS version (22.x) for macOS.

---

## ✅ After Upgrading

Once you've upgraded Node.js, come back to the project directory and run:

```bash
npm run dev
```

The app should start on `http://localhost:5173`

---

## 🛠️ Troubleshooting

**Still seeing old version?**
- Make sure to close and reopen your terminal
- Check PATH: `echo $PATH`
- If using nvm, make sure it's in your shell config (.zshrc or .bash_profile)

**Command not found after upgrade?**
```bash
# Reinstall node_modules if needed
rm -rf node_modules package-lock.json
npm install
```

---

## 📋 What's Already Done

✅ Tailwind CSS installed
✅ tailwind.config.js created
✅ postcss.config.js created
✅ All React components built
✅ All utility functions created
✅ Sample data loaded
✅ App is ready to run!

**Just need Node.js v20+ to proceed.** 🎉
