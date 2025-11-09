export interface FileData {
    name: string;
    path: string;
    content: string;
    size: number;
    isLarge: boolean;
}

export interface FileError {
    message: string;
    code?: number;
}