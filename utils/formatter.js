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

// Add this function to generate a file tree visualization
function generateFileTree(files) {
  const tree = {}

  // Build tree structure
  files.forEach((file) => {
    const parts = file.name.split("/")
    let current = tree

    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = null // Leaf node (file)
      } else {
        current[part] = current[part] || {}
        current = current[part]
      }
    })
  })

  // Generate tree string
  function renderTree(node, prefix = "", isLast = true, path = "") {
    let result = ""
    const entries = Object.entries(node || {})

    if (path) {
      result += prefix + (isLast ? "└── " : "├── ") + path.split("/").pop() + "\n"
    }

    if (node === null) return result

    const newPrefix = prefix + (isLast ? "    " : "│   ")

    entries.forEach(([key, value], i) => {
      const newPath = path ? `${path}/${key}` : key
      const isLastItem = i === entries.length - 1
      result += renderTree(value, newPrefix, isLastItem, newPath)
    })

    return result
  }

  return renderTree(tree, "", true, "")
}

// Export the function
export { generateFileTree }
