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

# create the issue
echo -e "${YELLOW}creating issue from: $ISSUE_FILE${NC}"
echo ""

if gh issue create --body-file "$ISSUE_FILE"; then
    echo ""
    echo -e "${GREEN}✓ issue created successfully${NC}"
    
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
    exit 1
fi