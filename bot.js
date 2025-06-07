import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js"
import { generateApp } from "./services/v0-service.js"
import { formatCodeResponse } from "./utils/formatter.js"
import dotenv from "dotenv"

dotenv.config()

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

client.once("ready", async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`)

  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName("generate-app")
      .setDescription("Generate a web application using v0 AI")
      .addStringOption((option) =>
        option.setName("prompt").setDescription("Describe the app you want to generate").setRequired(true),
      )
      .addAttachmentOption((option) =>
        option.setName("image1").setDescription("Optional: Upload an image/mockup to recreate").setRequired(false),
      )
      .addAttachmentOption((option) =>
        option.setName("image2").setDescription("Optional: Upload a second image/mockup").setRequired(false),
      )
      .addAttachmentOption((option) =>
        option.setName("image3").setDescription("Optional: Upload a third image/mockup").setRequired(false),
      ),
  ]

  try {
    await client.application.commands.set(commands)
    console.log("✅ Slash commands registered successfully")
  } catch (error) {
    console.error("❌ Error registering commands:", error)
  }
})

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === "generate-app") {
    await handleGenerateApp(interaction)
  }
})

async function handleGenerateApp(interaction) {
  const prompt = interaction.options.getString("prompt")
  const images = []

  // Collect all attached images
  for (let i = 1; i <= 3; i++) {
    const image = interaction.options.getAttachment(`image${i}`)
    if (image) {
      images.push(image)
    }
  }

  // Defer reply since v0 API might take time
  await interaction.deferReply()

  try {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Generating your app...")
      .setDescription(`**Prompt:** ${prompt}${images.length > 0 ? `\n**Images:** ${images.length} attached` : ""}`)
      .setColor(0x00ae86)
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })

    // Generate app using v0 API
    const result = await generateApp(prompt, images)

    // Format and send response
    await sendGeneratedApp(interaction, result, prompt)
  } catch (error) {
    console.error("Error generating app:", error)

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Generation Failed")
      .setDescription(`Sorry, I couldn't generate your app. Error: ${error.message}`)
      .setColor(0xff0000)
      .setTimestamp()

    await interaction.editReply({ embeds: [errorEmbed] })
  }
}

async function sendGeneratedApp(interaction, result, prompt) {
  const { content, files } = formatCodeResponse(result)

  const successEmbed = new EmbedBuilder()
    .setTitle("✅ App Generated Successfully!")
    .setDescription(`**Original Prompt:** ${prompt}\n\n**Generated:** ${files.length} files`)
    .addFields(
      {
        name: "🚀 Next Steps",
        value: "1. Download the files\n2. Run `npm install`\n3. Run `npm run dev`\n4. Open http://localhost:3000",
      },
      { name: "📝 Files Generated", value: files.map((f) => `• ${f.name}`).join("\n") || "Multiple components" },
    )
    .setColor(0x00ae86)
    .setTimestamp()

  // Create file attachments
  const attachments = files.map(
    (file) => new AttachmentBuilder(Buffer.from(file.content, "utf-8"), { name: file.name }),
  )

  // Split response if too long for Discord
  if (content.length > 2000) {
    await interaction.editReply({
      embeds: [successEmbed],
      files: attachments,
    })

    // Send code in separate message if needed
    const codeAttachment = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: "generated-code.md" })

    await interaction.followUp({
      content: "📄 **Generated Code:**",
      files: [codeAttachment],
    })
  } else {
    await interaction.editReply({
      content: `\`\`\`typescript\n${content.slice(0, 1900)}\n\`\`\``,
      embeds: [successEmbed],
      files: attachments,
    })
  }
}

client.login(process.env.DISCORD_BOT_TOKEN)
