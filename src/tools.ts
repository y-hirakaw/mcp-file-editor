export const tools = [
  {
    name: "read_file",
    description: "ファイルの内容を読み取る（全体または指定行数）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "読み取るファイルのパス",
        },
        start_line: {
          type: "number",
          description: "読み取り開始行番号（1から開始、省略時は1）",
        },
        end_line: {
          type: "number", 
          description: "読み取り終了行番号（省略時は最終行まで）",
        },
        max_lines: {
          type: "number",
          description: "最大読み取り行数（省略時は制限なし）",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "ファイルに内容を書き込む（既存ファイルを上書き）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "書き込むファイルのパス",
        },
        content: {
          type: "string",
          description: "書き込む内容",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "file_exists",
    description: "ファイルの存在確認",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "確認するファイルのパス",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "create_file",
    description: "新しいファイルを作成する（既存ファイルがある場合はエラー）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "作成するファイルのパス",
        },
        content: {
          type: "string",
          description: "初期内容（デフォルト: 空文字列）",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "append_file", 
    description: "ファイルに内容を追記する",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "追記するファイルのパス",
        },
        content: {
          type: "string",
          description: "追記する内容",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "get_file_info",
    description: "ファイルの詳細情報を取得（サイズ、更新日時など）",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "情報を取得するファイルのパス",
        },
      },
      required: ["path"],
    },
  },
];