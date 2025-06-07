import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

// Template for app generation success
export function createAppGenerationEmbed(prompt, files, projectId) {
  return new EmbedBuilder()
    .setTitle("✨ App Generated Successfully!")
    .setDescription(`Your application has been created based on your requirements.`)
    .setColor(0x00ae86)
    .addFields(
      { name: "📋 Original Prompt", value: `\`\`\`\n${prompt}\n\`\`\``, inline: false },
      { name: "📊 Project Stats", value: `${files.length} files generated`, inline: true },
      { name: "🆔 Project ID", value: projectId, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: "Powered by v0" })
}

// Template for file structure visualization
export function createFileStructureEmbed(fileTree) {
  return new EmbedBuilder()
    .setTitle("📁 File Structure")
    .setDescription("```\n" + fileTree + "\n```")
    .setColor(0x00ae86)
}

// Template for installation instructions
export function createInstallationEmbed() {
  return new EmbedBuilder()
    .setTitle("🛠️ Installation Instructions")
    .setDescription("Follow these steps to run your application locally:")
    .addFields(
      { name: "1️⃣ Download Files", value: "Click the 'Download Files' button above", inline: false },
      { name: "2️⃣ Install Dependencies", value: "```bash\nnpm install\n```", inline: false },
      { name: "3️⃣ Run Development Server", value: "```bash\nnpm run dev\n```", inline: false },
      { name: "4️⃣ Open Browser", value: "Navigate to http://localhost:3000", inline: false },
    )
    .setColor(0x00ae86)
}

// Template for feature highlights
export function createFeatureHighlightsEmbed(features) {
  const embed = new EmbedBuilder()
    .setTitle("✅ Feature Highlights")
    .setDescription("Your application includes these key features:")
    .setColor(0x00ae86)

  features.forEach((feature, index) => {
    embed.addFields({ name: `${index + 1}. ${feature.name}`, value: feature.description, inline: false })
  })

  return embed
}

// Template for technology stack
export function createTechStackEmbed() {
  return new EmbedBuilder()
    .setTitle("🔧 Technology Stack")
    .setColor(0x00ae86)
    .addFields(
      { name: "Framework", value: "Next.js (App Router)", inline: true },
      { name: "Styling", value: "Tailwind CSS", inline: true },
      { name: "Components", value: "shadcn/ui", inline: true },
      { name: "Language", value: "TypeScript", inline: true },
      { name: "Icons", value: "Lucide React", inline: true },
      { name: "Deployment", value: "Vercel", inline: true },
    )
}

// Create action buttons
export function createActionButtons(projectId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`download_${projectId}`)
      .setLabel("Download Files")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("📥"),
    new ButtonBuilder()
      .setCustomId(`deploy_${projectId}`)
      .setLabel("Deploy to Vercel")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🚀"),
    new ButtonBuilder()
      .setCustomId(`preview_${projectId}`)
      .setLabel("Preview Code")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("👁️"),
  )
}

// Create deployment success embed
export function createDeploymentSuccessEmbed(appName, url) {
  return new EmbedBuilder()
    .setTitle("✅ Deployment Successful")
    .setDescription(`Your app **${appName}** has been deployed!`)
    .setColor(0x00ae86)
    .addFields(
      { name: "Status", value: "✅ Live", inline: true },
      { name: "App Name", value: appName, inline: true },
      { name: "URL", value: url, inline: true },
      { name: "Dashboard", value: `[View on Vercel](https://vercel.com/dashboard)`, inline: true },
    )
    .setImage("https://placeholder.svg?height=200&width=400&query=App+Deployment+Successful")
    .setTimestamp()
    .setFooter({ text: "Powered by v0 & Vercel" })
}
