#!/bin/bash
# create-issue.sh - helper script to create github issues from markdown files
#
# usage: ./scripts/create-issue.sh <path-to-draft.md>
# example: ./scripts/create-issue.sh scripts/issue-templates/drafts/001-my-feature.md

set -e

# colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # no color

ISSUE_FILE=$1

# validation
if [ -z "$ISSUE_FILE" ]; then
    echo -e "${RED}error: no file specified${NC}"
    echo "usage: $0 <path-to-markdown-file>"
    echo "example: $0 scripts/issue-templates/drafts/001-my-feature.md"
    exit 1
fi

if [ ! -f "$ISSUE_FILE" ]; then
    echo -e "${RED}error: file not found: $ISSUE_FILE${NC}"
    exit 1
fi

# check if gh cli is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}error: github cli (gh) not found${NC}"
    echo "install it from: https://cli.github.com/"
    exit 1
fi

# check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}error: not authenticated with github${NC}"
    echo "run: gh auth login"
    exit 1
fi

# extract frontmatter and body
if ! grep -q "^---$" "$ISSUE_FILE"; then
    echo -e "${RED}error: no frontmatter found in file${NC}"
    exit 1
fi

# parse frontmatter
FRONTMATTER=$(awk '/^---$/{flag=!flag; next} flag' "$ISSUE_FILE" | head -n -0)
BODY=$(awk '/^---$/{ if(++count==2) flag=1; next } flag' "$ISSUE_FILE")

# extract values from frontmatter
TITLE=$(echo "$FRONTMATTER" | grep "^title:" | sed 's/title:\s*"*\(.*\)"*/\1/' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
LABELS=$(echo "$FRONTMATTER" | grep "^labels:" | sed 's/labels:\s*//' | sed 's/,\s*/,/g' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
ASSIGNEES=$(echo "$FRONTMATTER" | grep "^assignees:" | sed 's/assignees:\s*//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
MILESTONE=$(echo "$FRONTMATTER" | grep "^milestone:" | sed 's/milestone:\s*//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

# create temp file with body
TEMP_FILE=$(mktemp)
echo "$BODY" > "$TEMP_FILE"

# build gh command
GH_CMD="gh issue create --body-file \"$TEMP_FILE\""
[ -n "$TITLE" ] && GH_CMD="$GH_CMD --title \"$TITLE\""
[ -n "$LABELS" ] && GH_CMD="$GH_CMD --label \"$LABELS\""
[ -n "$ASSIGNEES" ] && GH_CMD="$GH_CMD --assignee \"$ASSIGNEES\""
[ -n "$MILESTONE" ] && GH_CMD="$GH_CMD --milestone \"$MILESTONE\""

# create the issue
echo -e "${YELLOW}creating issue from: $ISSUE_FILE${NC}"
echo ""

if eval $GH_CMD; then
    echo ""
    echo -e "${GREEN}✓ issue created successfully${NC}"
    
    # cleanup temp file
    rm -f "$TEMP_FILE"
    
    # archive the draft
    ARCHIVE_DIR="scripts/issue-templates/created"
    mkdir -p "$ARCHIVE_DIR"
    
    FILENAME=$(basename "$ISSUE_FILE")
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_NAME="${TIMESTAMP}_${FILENAME}"
    
    mv "$ISSUE_FILE" "$ARCHIVE_DIR/$ARCHIVE_NAME"
    echo -e "${GREEN}✓ draft archived to: $ARCHIVE_DIR/$ARCHIVE_NAME${NC}"
else
    echo ""
    echo -e "${RED}✗ failed to create issue${NC}"
    rm -f "$TEMP_FILE"
    exit 1
fi