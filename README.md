# refine

> beautiful PDFs from markdown, effortlessly

**refine** is a desktop application that converts markdown documents into professionally styled PDFs using customizable templates.

## status

🚧 **early development** - mvp in progress

## vision

refine aims to be the go-to tool for students, professionals, and content creators who want to produce polished documents without wrestling with complex formatting tools.

**mvp target:**
- import `.md` files
- preview with live rendering
- export to PDF with professional templates
- fast startup, minimal memory footprint

## tech stack

- **frontend:** angular
- **backend:** tauri (rust)
- **pdf generation:** typst
- **markdown parsing:** comrak/pulldown-cmark

## roadmap

### v0.1.0 - mvp
- [ ] markdown file import
- [ ] template selector (UNV-1 academic template)
- [ ] html preview (approximate rendering)
- [ ] pdf export via typst

### future
- integrated markdown editor
- multiple templates (corporate, resume, documentation)
- table of contents generation
- advanced typesetting features
- i18n support

## development

see [docs/dev/issue-workflow.md](docs/dev/issue-workflow.md) for contribution guidelines.

## license

tbd