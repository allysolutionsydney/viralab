#!/bin/bash
# ============================================================
# Viralab — One-command push to GitHub
# Usage: bash deploy.sh
# ============================================================

set -e

# ── Config ───────────────────────────────────────────────────
GH_USERNAME="allysolutionsydney"
REPO_NAME="viralab"
BRANCH="main"
# ─────────────────────────────────────────────────────────────

echo ""
echo "🚀 Viralab — GitHub Push"
echo "========================"
echo "🔑 Paste your GitHub Personal Access Token (input hidden):"
read -rs GH_TOKEN
echo ""

if [ -z "$GH_TOKEN" ]; then
  echo "❌ No token entered. Exiting."
  exit 1
fi

# Step 1 — Git init (if needed)
if [ ! -d ".git" ]; then
  echo "📁 Initialising git repo..."
  git init
  git branch -M $BRANCH
fi

git config user.name "$GH_USERNAME"
git config user.email "${GH_USERNAME}@users.noreply.github.com"

# Step 2 — Stage & commit
echo "📝 Staging all files..."
git add .
git commit -m "Deploy Viralab app" 2>/dev/null || echo "   (nothing new to commit)"

# Step 3 — Create GitHub repo (safe to re-run; ignores 422 if it exists)
echo "📡 Creating GitHub repository (if it doesn't exist)..."
HTTP_STATUS=$(curl -s -o /tmp/gh_response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Viralab - AI Provider Pipeline App\",\"private\":false}")

if [ "$HTTP_STATUS" = "201" ]; then
  echo "   ✅ GitHub repo created."
elif [ "$HTTP_STATUS" = "422" ]; then
  echo "   ℹ️  GitHub repo already exists — skipping creation."
else
  echo "   ⚠️  GitHub API returned status $HTTP_STATUS:"
  cat /tmp/gh_response.json
fi

# Step 4 — Push to GitHub
REMOTE_URL="https://${GH_TOKEN}@github.com/${GH_USERNAME}/${REPO_NAME}.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

echo "⬆️  Pushing to GitHub..."
git push -u origin $BRANCH --force

echo ""
echo "🎉 All done!"
echo "   GitHub : https://github.com/${GH_USERNAME}/${REPO_NAME}"
