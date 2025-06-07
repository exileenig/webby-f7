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
