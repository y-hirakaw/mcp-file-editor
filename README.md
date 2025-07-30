# mcp-file-editor

A minimal MCP (Model Context Protocol) server for **file editing operations**.

With this server you can read, write, create, append, and manage files in any directory—directly from an MCP-compatible client such as **Claude Code**. This server was specifically designed to solve Claude Code's limitations with markdown file editing.

## ✨ Features

- **Read** file contents with extension validation
  - **Line-specific reading**: Read specific line ranges or limit number of lines
  - **Efficient large file handling**: Avoid loading entire files when only parts are needed
- **Write** files (overwrite existing content)
- **Create** new files (error if file already exists)
- **Append** content to existing files
- **Check** file existence
- **Get** detailed file information (size, timestamps, permissions)
- **Security features**:
  - File extension restrictions (configurable)
  - Path traversal attack prevention
  - File size limits (configurable)
  - Japanese error messages for better UX

## 🛠️ Setup

This tool runs locally as an MCP server that your editor (Claude Code, VS Code, etc.) can talk to.

### Requirements

- **Node.js ≥ 18** (ES2022 modules)
- An MCP-capable client  
  - *Example:* Claude Code CLI

### Installation

1. Clone and build:
```bash
git clone <repository-url>
cd mcp-file-editor
npm install
npm run build
```

2. Configure in Claude Code settings:
```json
{
  "mcpServers": {
    "file-editor": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-file-editor/build/index.js"],
      "env": {
        "ALLOWED_EXTENSIONS": "md,txt,json,yaml,yml,csv,log",
        "MAX_FILE_SIZE": "10485760"
      }
    }
  }
}
```

## ⚙️ Configuration

Configure the server behavior using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_EXTENSIONS` | `md,txt,json,yaml,yml,csv,log` | Comma-separated list of allowed file extensions (without dots) |
| `MAX_FILE_SIZE` | `10485760` | Maximum file size in bytes (default: 10MB) |

### Examples

```bash
# Allow only markdown and text files
ALLOWED_EXTENSIONS="md,txt"

# Set 5MB file size limit  
MAX_FILE_SIZE="5242880"

# Extensions can be specified with or without dots
ALLOWED_EXTENSIONS=".md,.txt,.json"  # Also works
```

## 🔧 Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `read_file` | Read file contents (full or partial) | `path` (string), `start_line` (number, optional), `end_line` (number, optional), `max_lines` (number, optional) |
| `write_file` | Write/overwrite file | `path` (string), `content` (string) |
| `create_file` | Create new file | `path` (string), `content` (string, optional) |
| `append_file` | Append to existing file | `path` (string), `content` (string) |
| `file_exists` | Check if file exists | `path` (string) |
| `get_file_info` | Get file metadata | `path` (string) |

### 📖 read_file Advanced Usage

The `read_file` tool supports flexible line-based reading:

```json
// Read entire file (default)
{"path": "document.md"}

// Read first 10 lines
{"path": "log.txt", "max_lines": 10}

// Read lines 100-200
{"path": "code.js", "start_line": 100, "end_line": 200}

// Read 20 lines starting from line 50
{"path": "data.csv", "start_line": 50, "max_lines": 20}

// Read from line 10 to end of file
{"path": "config.json", "start_line": 10}
```

**Features:**
- Line numbers start from 1 (human-readable)
- Automatic range validation with helpful error messages
- Header information showing selected range and total lines
- Memory-efficient for large files

## 🛡️ Security Features

- **Extension filtering**: Only allows specified file types
- **Path validation**: Prevents directory traversal attacks (`../` protection)
- **Size limits**: Configurable maximum file size
- **Safe defaults**: Secure configuration out of the box

## 🎯 Why?

This project was created to solve Claude Code's specific limitation where markdown files require reading before writing. It provides:

- **Reliable file operations** for Claude Code
- **Simple, focused functionality** without complexity
- **Security-first approach** with configurable restrictions
- **Clean, maintainable codebase** for easy customization

## 📁 Project Structure

```
src/
├── index.ts        # Main server entry point
├── config.ts       # Configuration management
├── validation.ts   # Security validation functions
├── tools.ts        # Tool definitions and schemas
└── handlers.ts     # Business logic implementations
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode (development)
npm run dev

# Start server
npm start
```

## 🤔 Why This Design?

- **Minimal and focused**: Only essential file operations
- **Security-conscious**: Multiple validation layers
- **Claude Code optimized**: Solves READ-before-WRITE constraints
- **Efficient file handling**: Line-based reading for large files
- **Modular architecture**: Easy to extend and maintain
- **Type-safe**: Full TypeScript implementation
- **Well-documented**: Comprehensive JSDoc comments and examples

---

## 🙏 Contributing

This is a learning project for MCP best practices—bug reports, suggestions, and PRs are always welcome!

**特に日本語でのフィードバックも歓迎します！**