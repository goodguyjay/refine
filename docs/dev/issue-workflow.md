# issue workflow

this document explains how to create and manage issues for the refine project.

## prerequisites

- [github cli](https://cli.github.com/) installed
- authenticated with `gh auth login`
- repository set as default: `gh repo set-default`

## creating issues

### method 1: using helper scripts

**bash/linux/macos:**
```bash
./scripts/create-issue.sh scripts/issue-templates/drafts/001-my-feature.md
```

**windows (powershell):**
```powershell
.\scripts\create-issue.ps1 scripts\issue-templates\drafts\001-my-feature.md
```

### method 2: directly with gh cli
```bash
gh issue create --body-file scripts/issue-templates/drafts/001-my-feature.md
```

## workflow steps

1. **create a draft**
```bash
   cp scripts/issue-templates/feature.md scripts/issue-templates/drafts/001-my-feature.md
```

2. **edit the draft**
   - fill in title, description, acceptance criteria
   - add technical tasks
   - set labels and milestone

3. **create the issue**
```bash
   ./scripts/create-issue.sh scripts/issue-templates/drafts/001-my-feature.md
```

4. **draft is archived**
   - script automatically moves completed drafts to `scripts/issue-templates/created/`

## issue templates

### feature
use for new functionality or capabilities.

### bug
use for defects or unexpected behavior.

### enhancement
use for improvements to existing features.

## naming convention

drafts should follow this pattern:
```
NNN-short-descriptive-title.md
```

examples:
- `001-basic-md-import.md`
- `002-template-selector-ui.md`
- `003-typst-integration.md`

## labels

common labels used in this project:
- `mvp` - required for minimum viable product
- `feature` - new functionality
- `bug` - something broken
- `enhancement` - improvement to existing feature
- `documentation` - docs updates
- `good first issue` - suitable for newcomers
- `help wanted` - need assistance

## milestones

- `v0.1.0` - mvp release
- `v0.2.0` - first feature expansion
- `backlog` - future consideration