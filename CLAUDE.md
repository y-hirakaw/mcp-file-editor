# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
必ず日本語でチャットを返してください。

## Project Overview

This is a Model Context Protocol (MCP) server project for file editing, specifically designed to solve Claude Code's limitations with markdown file editing. The project name is `mcp-file-editor`.

## Current State

This is an empty repository containing only basic documentation files:
- README.md (Japanese, describes the project requirements)
- LICENSE (MIT License)
- request_details.md (detailed Japanese specification document)
- .gitignore (Node.js template)

**No code implementation exists yet** - this is a project specification that needs to be implemented.

## Project Requirements (from request_details.md)

The goal is to create a TypeScript-based MCP server that provides robust file editing capabilities with the following tools:

### Core Tools to Implement
- `read_file` - Read file contents
- `write_file` - Write/overwrite file contents  
- `append_file` - Append content to files
- `create_file` - Create new files (error if exists)
- `delete_file` - Delete files
- `list_files` - List directory contents with glob patterns
- `file_exists` - Check file existence
- `get_file_info` - Get file metadata
- `set_allowed_extensions` - Configure allowed file extensions
- `get_allowed_extensions` - Get current allowed extensions

### Security Features Required
- File extension restrictions (default: .md, .txt, .json, .yaml, .yml, .csv, .log)
- Path traversal attack prevention
- Automatic backup creation (.bak files)
- File size limits (10MB default)
- Configurable safety settings

### Planned Architecture
```
src/
├── index.ts              # Main MCP server
├── config/settings.ts    # Configuration management  
├── tools/file-operations.ts # Tool implementations
├── tools/safety.ts       # Security/safety features
└── utils/validation.ts   # Validation utilities
```

### Dependencies to Use
- `@modelcontextprotocol/sdk`: ^0.6.0
- TypeScript with Node16 module resolution
- Zod for parameter validation

## Development Commands

Since no package.json exists yet, these are the planned commands from the specification:

```bash
npm run build    # Compile TypeScript and make executable
npm run dev      # Watch mode compilation  
npm run start    # Run the built server
```

## Implementation Notes

When implementing this project:

1. Use StdioServerTransport for Claude Code communication
2. Implement proper async/await patterns
3. Use Zod schemas for parameter validation
4. Provide detailed error messages in Japanese
5. Always check file extensions before operations
6. Create .bak files before modifications
7. Log operations to console.error for debugging

## Usage Pattern

The server is intended to solve Claude Code's issue where it tries to write files without reading them first, which fails. This MCP server should provide more reliable file operations.