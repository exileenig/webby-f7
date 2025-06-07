import fetch from "node-fetch"

export async function generateApp(prompt, images = []) {
  const messages = await buildMessages(prompt, images)

  const response = await fetch("https://api.v0.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.V0_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "v0-1.0-md",
      messages: messages,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`v0 API Error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function buildMessages(prompt, images) {
  const messages = [
    {
      role: "system",
      content:
        "You are v0, an AI assistant that generates complete, production-ready web applications. Always provide complete, working code with proper file structure.",
    },
  ]

  if (images.length > 0) {
    // Build multimodal message with images
    const content = [
      {
        type: "text",
        text: prompt,
      },
    ]

    // Add images to the message
    for (const image of images) {
      try {
        const imageResponse = await fetch(image.url)
        const imageBuffer = await imageResponse.buffer()
        const base64Image = imageBuffer.toString("base64")

        content.push({
          type: "image_url",
          image_url: {
            url: `data:${image.contentType};base64,${base64Image}`,
          },
        })
      } catch (error) {
        console.error("Error processing image:", error)
      }
    }

    messages.push({
      role: "user",
      content: content,
    })
  } else {
    // Text-only message
    messages.push({
      role: "user",
      content: prompt,
    })
  }

  return messages
}

// Add this function to extract features from the generated content
export function extractFeatures(content) {
  // Look for common patterns that indicate features
  const features = []

  // Check for authentication
  if (content.includes("auth") || content.includes("login") || content.includes("sign")) {
    features.push({
      name: "Authentication",
      description: "User login and registration system",
    })
  }

  // Check for dark mode
  if (content.includes("dark-mode") || content.includes("theme-provider") || content.includes("useTheme")) {
    features.push({
      name: "Dark Mode",
      description: "Toggle between light and dark themes",
    })
  }

  // Check for responsive design
  if (content.includes("md:") || content.includes("lg:") || content.includes("sm:")) {
    features.push({
      name: "Responsive Design",
      description: "Optimized for mobile, tablet, and desktop",
    })
  }

  // Check for forms
  if (content.includes("<form") || content.includes("handleSubmit")) {
    features.push({
      name: "Interactive Forms",
      description: "User input forms with validation",
    })
  }

  // Check for API routes
  if (content.includes("api/") || content.includes("route.ts")) {
    features.push({
      name: "API Integration",
      description: "Backend API routes for data handling",
    })
  }

  // Check for database
  if (content.includes("database") || content.includes("supabase") || content.includes("prisma")) {
    features.push({
      name: "Database Integration",
      description: "Connected to a database for data persistence",
    })
  }

  // Add some default features if none were detected
  if (features.length === 0) {
    features.push(
      {
        name: "Modern UI",
        description: "Clean and professional user interface",
      },
      {
        name: "Component-Based Architecture",
        description: "Modular components for easy maintenance",
      },
      {
        name: "SEO Optimized",
        description: "Built with search engine optimization in mind",
      },
    )
  }

  return features
}
