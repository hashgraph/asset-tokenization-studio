#!/bin/bash

###############################################################################
# Git Configuration Setup for Asset Tokenization Studio
#
# This script configures Git to automatically:
# - Add DCO sign-off to all commits (Signed-off-by line)
# - Sign all commits with GPG (cryptographic signature)
# - Use YOUR identity (reads from existing git config)
#
# Usage: bash .github/scripts/setup-git.sh
###############################################################################

set -e

echo "🔧 Setting up Git configuration for Asset Tokenization Studio..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# Step 1: Verify Author Identity (SECURITY CRITICAL)
###############################################################################

echo "📝 Step 1: Verifying your Git identity..."
echo ""

# Get current git config
CURRENT_NAME=$(git config user.name || echo "")
CURRENT_EMAIL=$(git config user.email || echo "")

if [ -z "$CURRENT_NAME" ] || [ -z "$CURRENT_EMAIL" ]; then
    echo -e "${RED}❌ Git identity not configured${NC}"
    echo ""
    echo "You must configure your identity before proceeding:"
    echo ""
    echo "Run these commands with YOUR information:"
    echo "  git config user.name \"Your Name\""
    echo "  git config user.email \"your.email@example.com\""
    echo ""
    echo "For global configuration (recommended):"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
    echo ""
    echo -e "${YELLOW}⚠️  SECURITY: Never use another developer's identity${NC}"
    echo "   Each developer must commit with their own name and email"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Current Git identity:${NC}"
echo "   Name:  $CURRENT_NAME"
echo "   Email: $CURRENT_EMAIL"
echo ""

# Confirm identity
echo -e "${YELLOW}⚠️  Important: Commits will be signed with this identity${NC}"
read -p "Is this correct? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please update your Git identity first:"
    echo "  git config user.name \"Your Name\""
    echo "  git config user.email \"your.email@example.com\""
    echo ""
    exit 1
fi

AUTHOR_NAME="$CURRENT_NAME"
AUTHOR_EMAIL="$CURRENT_EMAIL"

echo ""

###############################################################################
# Step 2: Enable Automatic DCO Sign-off
###############################################################################

echo "📝 Step 2: Enabling automatic DCO sign-off..."
echo ""

git config format.signoff true

echo -e "${GREEN}✅ DCO sign-off enabled${NC}"
echo "   All commits will automatically include:"
echo "   Signed-off-by: $AUTHOR_NAME <$AUTHOR_EMAIL>"
echo ""

###############################################################################
# Step 3: Enable GPG Signing
###############################################################################

echo "📝 Step 3: Enabling GPG commit signing..."
echo ""

# Check if GPG is available
if ! command -v gpg &> /dev/null; then
    echo -e "${RED}❌ GPG not found${NC}"
    echo ""
    echo "Please install GPG:"
    echo "  - macOS:   brew install gnupg"
    echo "  - Linux:   apt-get install gnupg  (or yum install gnupg)"
    echo "  - Windows: https://www.gnupg.org/download/"
    echo ""
    exit 1
fi

# Check if user has GPG keys
GPG_KEYS=$(gpg --list-secret-keys --keyid-format=long 2>/dev/null | grep ^sec || true)

if [ -z "$GPG_KEYS" ]; then
    echo -e "${YELLOW}⚠️  No GPG keys found${NC}"
    echo ""
    echo "You need to create a GPG key for signing commits."
    echo ""
    echo -e "${BLUE}Steps to generate a GPG key:${NC}"
    echo "  1. Run: gpg --full-generate-key"
    echo "  2. Choose: RSA and RSA (default)"
    echo "  3. Key size: 4096 bits"
    echo "  4. Expiration: 0 (does not expire) or 2y (2 years)"
    echo "  5. Real name: $AUTHOR_NAME"
    echo "  6. Email: $AUTHOR_EMAIL"
    echo "  7. Enter a passphrase (store it safely!)"
    echo ""

    read -p "Would you like to generate a GPG key now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Launching GPG key generation wizard..."
        echo ""
        gpg --full-generate-key
        echo ""
        echo -e "${GREEN}✅ GPG key generated${NC}"
        GPG_KEYS=$(gpg --list-secret-keys --keyid-format=long 2>/dev/null | grep ^sec)
    else
        echo ""
        echo "Skipping GPG signing configuration."
        echo "To enable GPG signing later:"
        echo "  1. Generate key: gpg --full-generate-key"
        echo "  2. Run this script again: bash .github/scripts/setup-git.sh"
        echo ""
        exit 0
    fi
fi

# Get the GPG key ID for the user's email
GPG_KEY_ID=$(gpg --list-secret-keys --keyid-format=long "$AUTHOR_EMAIL" 2>/dev/null | grep ^sec | head -1 | cut -d'/' -f2 | cut -d' ' -f1 || true)

if [ -z "$GPG_KEY_ID" ]; then
    echo -e "${YELLOW}⚠️  No GPG key found for email: $AUTHOR_EMAIL${NC}"
    echo ""
    echo "Available GPG keys:"
    gpg --list-secret-keys --keyid-format=long | grep -A 1 ^sec
    echo ""
    echo "Either:"
    echo "  1. Generate a key with your email: gpg --full-generate-key"
    echo "  2. Or manually set signing key: git config user.signingkey <KEY_ID>"
    echo ""
    exit 1
fi

git config user.signingkey "$GPG_KEY_ID"
git config commit.gpgsign true

echo -e "${GREEN}✅ GPG signing enabled${NC}"
echo "   Signing key: $GPG_KEY_ID"
echo "   All commits will be cryptographically signed"
echo ""

# Test GPG signing
echo "🧪 Testing GPG signature..."
echo "test" | gpg --clearsign --default-key "$GPG_KEY_ID" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GPG signing test successful${NC}"
else
    echo -e "${YELLOW}⚠️  GPG signing test failed${NC}"
    echo ""
    echo "Your GPG key may require a passphrase or additional configuration."
    echo ""
    echo "If you're on macOS/Linux, add this to your shell profile:"
    echo "  export GPG_TTY=\$(tty)"
    echo ""
    echo "If using VS Code or IDE:"
    echo "  git config --global gpg.program gpg"
    echo ""
fi
echo ""

###############################################################################
# Step 4: Configure GPG Agent (for passphrase caching)
###############################################################################

echo "📝 Step 4: Configuring GPG agent..."
echo ""

# Ensure GPG agent is running
if pgrep -x "gpg-agent" > /dev/null; then
    echo -e "${GREEN}✅ GPG agent is running${NC}"
else
    echo -e "${YELLOW}⚠️  Starting GPG agent...${NC}"
    gpg-agent --daemon > /dev/null 2>&1 || true
fi

# Check shell profile for GPG_TTY
SHELL_PROFILE=""
if [ -f ~/.zshrc ]; then
    SHELL_PROFILE="~/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_PROFILE="~/.bashrc"
fi

if [ -n "$SHELL_PROFILE" ]; then
    if ! grep -q "export GPG_TTY" "$SHELL_PROFILE" 2>/dev/null; then
        echo ""
        echo -e "${BLUE}💡 Tip: Add this to your $SHELL_PROFILE for better GPG integration:${NC}"
        echo "   export GPG_TTY=\$(tty)"
        echo ""
    fi
fi

echo ""

###############################################################################
# Summary
###############################################################################

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Git configuration complete!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Configuration applied for:"
echo "  👤 Author: $AUTHOR_NAME <$AUTHOR_EMAIL>"
echo "  ✅ DCO sign-off: Automatic (format.signoff = true)"
echo "  ✅ GPG signing: Automatic (commit.gpgsign = true)"
echo "  🔑 GPG key: $GPG_KEY_ID"
echo ""
echo "Your commits will now automatically include:"
echo "  1. 🔏 GPG signature (cryptographic verification)"
echo "  2. ✍️  DCO sign-off (Signed-off-by: $AUTHOR_NAME <$AUTHOR_EMAIL>)"
echo ""
echo "Test it:"
echo "  git commit -m \"test: verify automatic signatures\""
echo "  git log -1 --show-signature"
echo "  git verify-commit HEAD"
echo ""
echo -e "${YELLOW}⚠️  Security Reminder:${NC}"
echo "  - Never commit with another developer's identity"
echo "  - Keep your GPG passphrase secure"
echo "  - Add your GPG public key to GitHub: https://github.com/settings/keys"
echo ""
echo "═══════════════════════════════════════════════════════════════"
