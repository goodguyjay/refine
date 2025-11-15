use crate::error::{AppError, ErrorResponse};
use comrak::nodes::{AstNode, NodeValue};
use comrak::{parse_document, Arena, ComrakOptions};
use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime};
use typst::layout::PagedDocument;
use typst::syntax::{FileId, Source};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Library, LibraryExt, World};
use typst_kit::fonts::FontSearcher;
use typst_pdf::PdfOptions;

struct MinimalWorld {
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    fonts: Vec<Font>,
    source: Source,
}

impl MinimalWorld {
    fn new(content: String) -> Self {
        let source = Source::detached(content);

        let mut searcher = FontSearcher::new();
        searcher.include_system_fonts(true);

        let font_result = searcher.search_with(["../../assets/fonts/"]);

        let fonts: Vec<Font> = font_result
            .fonts
            .iter()
            .filter_map(|slot| slot.get())
            .collect();

        Self {
            library: LazyHash::new(Library::default()),
            book: LazyHash::new(font_result.book),
            fonts,
            source,
        }
    }
}

impl World for MinimalWorld {
    fn library(&self) -> &LazyHash<Library> {
        &self.library
    }

    fn book(&self) -> &LazyHash<FontBook> {
        &self.book
    }

    fn main(&self) -> FileId {
        self.source.id()
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.source.id() {
            Ok(self.source.clone())
        } else {
            Err(FileError::NotFound(id.vpath().as_rootless_path().into()))
        }
    }

    fn file(&self, id: FileId) -> FileResult<Bytes> {
        Err(FileError::NotFound(id.vpath().as_rootless_path().into()))
    }

    fn font(&self, index: usize) -> Option<Font> {
        self.fonts.get(index).cloned()
    }

    fn today(&self, _offset: Option<i64>) -> Option<Datetime> {
        // temp without a full Engine context
        None
    }
}

/// convert markdown to typst syntax
///
/// poc supports:
/// - headings (h1 to h6)
/// - paragraphs
/// - bold and italic
fn markdown_to_typst(markdown: &str) -> Result<String, AppError> {
    tracing::info!("converting markdown to typst");

    let arena = Arena::new();
    let options = ComrakOptions::default();

    let root = parse_document(&arena, markdown, &options);

    let mut output = String::new();

    // minimal typst preamble
    output.push_str(
        r#"#set page(
            paper: "a4",
            margin: (x: 2.5cm, y: 2.5cm),
        )

        #set text(
            font: "Inter",
            size: 11pt,
        )

        #set par(justify: true)

        "#,
    );

    // walk the ast and convert to typst
    walk_ast(root, &mut output)?;

    tracing::debug!("typst output:\n{}", output);

    Ok(output)
}

fn walk_ast<'a>(node: &'a AstNode<'a>, output: &mut String) -> Result<(), AppError> {
    match &node.data.borrow().value {
        NodeValue::Document => {
            // just process children
            for child in node.children() {
                walk_ast(child, output)?;
            }
        }

        NodeValue::Heading(heading) => {
            let level_marker = "=".repeat(heading.level as usize);
            output.push_str(&level_marker);
            output.push(' ');

            for child in node.children() {
                walk_ast(child, output)?;
            }

            output.push_str("\n\n");
        }

        NodeValue::Paragraph => {
            for child in node.children() {
                walk_ast(child, output)?;
            }
            output.push_str("\n\n");
        }

        NodeValue::Text(text) => {
            let text_str = std::str::from_utf8(text).map_err(|e| {
                AppError::MarkdownParsingError(format!("invalid UTF-8 text: {}", e))
            })?;
            output.push_str(text_str);
        }

        NodeValue::Strong => {
            output.push('*');
            for child in node.children() {
                walk_ast(child, output)?;
            }
            output.push('*');
        }

        NodeValue::Emph => {
            output.push('_');
            for child in node.children() {
                walk_ast(child, output)?;
            }
            output.push('_');
        }

        NodeValue::SoftBreak | NodeValue::LineBreak => {
            output.push(' ');
        }

        _ => {
            tracing::debug!("ignoring unsupported node: {:?}", node.data.borrow().value);
            for child in node.children() {
                walk_ast(child, output)?;
            }
        }
    }

    Ok(())
}

fn compile_typst(typst_content: String) -> Result<Vec<u8>, AppError> {
    tracing::info!("compiling typst to pdf");

    let world = MinimalWorld::new(typst_content);

    // compiling...
    let warned = typst::compile(&world);

    let document: PagedDocument = warned.output.map_err(|errors| {
        let error_messages: Vec<String> =
            errors.iter().map(|e| format!("{:?}", e.message)).collect();

        let combined = if error_messages.is_empty() {
            "compilation failed with unknown error".to_string()
        } else {
            error_messages.join("; ")
        };
        tracing::error!("typst compilation failed: {}", combined);
        AppError::TypstCompilationError(combined)
    })?;

    tracing::debug!(
        "typst compilation successful, pdf size: {} bytes",
        document.pages.len()
    );

    // exporting...
    let pdf_bytes = typst_pdf::pdf(&document, &PdfOptions::default()).map_err(|errors| {
        let error_messages: Vec<String> =
            errors.iter().map(|e| format!("{:?}", e.message)).collect();

        let combined = if error_messages.is_empty() {
            "pdf export failed with unknown error".to_string()
        } else {
            error_messages.join("; ")
        };
        tracing::error!("pdf export failed: {}", combined);
        AppError::TypstCompilationError(combined)
    })?;

    tracing::info!("pdf export successful, size: {} bytes", pdf_bytes.len());

    Ok(pdf_bytes)
}

#[tauri::command]
pub async fn markdown_to_pdf(markdown: String) -> Result<Vec<u8>, ErrorResponse> {
    tracing::info!("markdown_to_pdf command invoked ({} bytes)", markdown.len());

    let typst = markdown_to_typst(&markdown)?;
    let pdf = compile_typst(typst)?;

    Ok(pdf)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_markdown_to_pdf_pipeline() {
        let markdown = r#"# Test Document

        This is a **bold** statement and an *italic* one.

        ## Subsection

        Another paragraph here with some **bold** and *italic* text mixed in.

        ### Deep heading

        Even deeper content.
        "#;

        // test the internal functions directly (they're sync)
        let typst = markdown_to_typst(markdown).unwrap();
        let pdf_bytes = compile_typst(typst).unwrap();

        assert!(
            pdf_bytes.len() > 1000,
            "PDF output should be larger than 1000 bytes, got {}",
            pdf_bytes.len()
        );
        assert_eq!(
            &pdf_bytes[0..4],
            b"%PDF",
            "PDF should start with magic number"
        );

        println!(
            "integration test passed: generated PDF size: {} bytes",
            pdf_bytes.len()
        );
    }

    #[test]
    fn test_markdown_to_typst_headings() {
        let markdown = "# H1\n## H2\n### H3\n";
        let typst = markdown_to_typst(markdown).unwrap();

        assert!(typst.contains("= H1"));
        assert!(typst.contains("== H2"));
        assert!(typst.contains("=== H3"));
    }

    #[test]
    fn test_markdown_to_typst_formatting() {
        let markdown = "This is **bold** and *italic* text.";
        let typst = markdown_to_typst(markdown).unwrap();

        assert!(typst.contains("*bold*"));
        assert!(typst.contains("_italic_"));
    }
}
