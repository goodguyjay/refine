use crate::error::ErrorResponse;
use comrak::{markdown_to_html, ComrakOptions};

#[tauri::command]
pub async fn parse_markdown(content: String) -> Result<String, ErrorResponse> {
    tracing::info!("parsing markdown ({} bytes)", content.len());

    if content.is_empty() {
        tracing::warn!("empty markdown content");
        return Ok(String::new());
    }

    let mut options = ComrakOptions::default();
    options.ext_strikethrough = true;
    options.ext_table = true;
    options.ext_autolink = true;
    options.ext_tasklist = true;

    let html = markdown_to_html(&content, &options);

    tracing::info!("markdown parsed successfully ({} bytes html)", html.len());

    Ok(html)
}
