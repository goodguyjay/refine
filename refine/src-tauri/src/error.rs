use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("file not found: {0}")]
    FileNotFound(String),

    #[error("failed to read file: {0}")]
    FileReadError(String),

    #[error("invalid file encoding: {0}")]
    InvalidEncoding(String),

    #[error("file too large: {size} bytes (max {max} bytes)")]
    FileTooLarge { size: u64, max: u64 },

    #[error("typst compilation failed: {0}")]
    TypstCompilationError(String),

    #[error("markdown parsing error: {0}")]
    MarkdownParsingError(String),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl From<AppError> for ErrorResponse {
    fn from(error: AppError) -> Self {
        ErrorResponse {
            error: error.to_string(),
        }
    }
}
