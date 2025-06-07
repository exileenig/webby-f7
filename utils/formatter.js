export function formatCodeResponse(content) {
  const files = extractCodeBlocks(content)
  const cleanContent = content.replace(/```[\s\S]*?```/g, "[Code Block]")

  return {
    content: cleanContent,
    files: files,
  }
}

function extractCodeBlocks(content) {
  const codeBlockRegex = /```(\w+)?\s*file="([^"]+)"[\s\S]*?\n([\s\S]*?)```/g
  const files = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, language, filename, code] = match
    files.push({
      name: filename,
      content: code.trim(),
      language: language || "typescript",
    })
  }

  // If no files found, create a single file with all code blocks
  if (files.length === 0) {
    const simpleCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/g
    let allCode = ""

    while ((match = simpleCodeRegex.exec(content)) !== null) {
      allCode += match[1] + "\n\n"
    }

    if (allCode.trim()) {
      files.push({
        name: "generated-app.tsx",
        content: allCode.trim(),
        language: "typescript",
      })
    }
  }

  return files
}
