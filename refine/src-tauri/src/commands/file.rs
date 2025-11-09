use crate::error::{AppError, ErrorResponse};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri_plugin_dialog::DialogExt;

const MAX_FILE_SIZE: u64 = 50 * 1024 * 1024; // 50 MB
const WARN_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10 MB

#[derive(Debug, Serialize, Deserialize)]
pub struct FileData {
    pub name: String,
    pub path: String,
    pub content: String,
    pub size: u64,
    pub is_large: bool,
}

#[tauri::command]
pub async fn open_file_dialog(app: tauri::AppHandle) -> Result<Option<String>, ErrorResponse> {
    tracing::info!("opening file dialog");

    let file_path = app
        .dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            tracing::info!("file selected: {:?}", path);
            Ok(Some(path.to_string()))
        }
        None => {
            tracing::info!("file dialog cancelled");
            Ok(None)
        }
    }
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<FileData, ErrorResponse> {
    tracing::info!("reading file: {}", path);

    let path_buf = PathBuf::from(&path);

    // check if file exists
    if !path_buf.exists() {
        tracing::error!("file not found: {}", path);
        return Err(AppError::FileNotFound(path).into());
    }

    // file metadata
    let metadata =
        std::fs::metadata(&path_buf).map_err(|e| AppError::FileReadError(e.to_string()))?;

    let file_size = metadata.len();

    if file_size > MAX_FILE_SIZE {
        tracing::error!("file too large: {} bytes", file_size);
        return Err(AppError::FileTooLarge {
            size: file_size,
            max: MAX_FILE_SIZE,
        }
        .into());
    }

    let is_large = file_size > WARN_FILE_SIZE;
    if is_large {
        tracing::warn!("large file detected: {} bytes", file_size);
    }

    let content =
        std::fs::read_to_string(&path_buf).map_err(|e| AppError::InvalidEncoding(e.to_string()))?;

    let file_name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    tracing::info!(
        "file read successfully: {} ({} bytes)",
        file_name,
        file_size
    );

    Ok(FileData {
        name: file_name,
        path,
        content,
        size: file_size,
        is_large,
    })
}
