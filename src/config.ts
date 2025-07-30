export interface Config {
  allowedExtensions: string[];
  maxFileSize: number;
}

export function loadConfig(): Config {
  const allowedExtensions = process.env.ALLOWED_EXTENSIONS 
    ? process.env.ALLOWED_EXTENSIONS.split(',').map(ext => {
        const trimmed = ext.trim();
        return trimmed.startsWith('.') ? trimmed : '.' + trimmed;
      })
    : [".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".log"];

  const maxFileSize = process.env.MAX_FILE_SIZE 
    ? parseInt(process.env.MAX_FILE_SIZE, 10)
    : 10485760; // デフォルト10MB

  return {
    allowedExtensions,
    maxFileSize
  };
}

export function logConfig(config: Config): void {
  console.error(`mcp-file-editor設定:
  許可拡張子: ${config.allowedExtensions.join(', ')}
  最大ファイルサイズ: ${config.maxFileSize} bytes`);
}