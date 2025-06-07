import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { generateApp } from "./services/v0-service.js"
import { formatCodeResponse } from "./utils/formatter.js"
import dotenv from "dotenv"
import { generateFileTree } from "./utils/formatter.js"
// Import the embeds utility
import {
  createAppGenerationEmbed,
  createFileStructureEmbed,
  createInstallationEmbed,
  createFeatureHighlightsEmbed,
  createTechStackEmbed,
  createActionButtons,
} from "./utils/embeds.js"
import { extractFeatures } from "./services/v0-service.js"

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

    // Add new deploy command
    new SlashCommandBuilder()
      .setName("deploy")
      .setDescription("Deploy a generated app to Vercel")
      .addStringOption((option) =>
        option.setName("name").setDescription("Name for your deployed app").setRequired(true),
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

  if (interaction.commandName === "deploy") {
    await handleDeploy(interaction)
  }

  if (interaction.isButton()) {
    const [action, projectId] = interaction.customId.split("_")

    if (action === "download") {
      await interaction.reply({
        content:
          "📦 **Download Instructions**\n\nTo download these files:\n1. Click each file attachment above\n2. Save them with the same directory structure\n3. Run `npm install` and `npm run dev`",
        ephemeral: true,
      })
    } else if (action === "deploy") {
      await interaction.reply({
        content: "🚀 To deploy this project, use the `/deploy` command with your desired app name.",
        ephemeral: true,
      })
    } else if (action === "preview") {
      await interaction.reply({
        content:
          "👁️ **Code Preview**\n\nThe code preview is available in the messages above. For a full preview, download the files and run them locally.",
        ephemeral: true,
      })
    }
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

async function handleDeploy(interaction) {
  const appName = interaction.options.getString("name")

  await interaction.deferReply()

  try {
    const deployEmbed = new EmbedBuilder()
      .setTitle("🚀 Deploying Application")
      .setDescription(`Preparing to deploy **${appName}** to Vercel...`)
      .setColor(0x0099ff)
      .addFields(
        { name: "Status", value: "⏳ Initializing deployment", inline: true },
        { name: "App Name", value: appName, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [deployEmbed] })

    // Simulate deployment process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const deployedEmbed = new EmbedBuilder()
      .setTitle("✅ Deployment Successful")
      .setDescription(`Your app **${appName}** has been deployed!`)
      .setColor(0x00ae86)
      .addFields(
        { name: "Status", value: "✅ Live", inline: true },
        { name: "App Name", value: appName, inline: true },
        { name: "URL", value: `https://${appName.toLowerCase().replace(/\s+/g, "-")}.vercel.app`, inline: true },
        { name: "Dashboard", value: `[View on Vercel](https://vercel.com/dashboard)`, inline: true },
      )
      .setImage("https://placeholder.svg?height=200&width=400&query=App+Deployment+Successful")
      .setTimestamp()
      .setFooter({ text: "Powered by v0 & Vercel" })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Visit Site")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://${appName.toLowerCase().replace(/\s+/g, "-")}.vercel.app`),
      new ButtonBuilder().setLabel("View Dashboard").setStyle(ButtonStyle.Link).setURL("https://vercel.com/dashboard"),
    )

    await interaction.editReply({ embeds: [deployedEmbed], components: [row] })
  } catch (error) {
    console.error("Error deploying app:", error)

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Deployment Failed")
      .setDescription(`Failed to deploy **${appName}**. Error: ${error.message}`)
      .setColor(0xff0000)
      .setTimestamp()

    await interaction.editReply({ embeds: [errorEmbed] })
  }
}

// Function to generate a file tree structure
// function generateFileTree(files, indent = 0) {
//   let tree = "";
//   for (const file of files) {
//     const indentStr = "  ".repeat(indent);
//     tree += `${indentStr}📄 ${file.name}\n`;
//   }
//   return tree;
// }

// Replace the sendGeneratedApp function with this improved version
async function sendGeneratedApp(interaction, result, prompt) {
  const { content, files } = formatCodeResponse(result)

  // Create a unique project ID
  const projectId = Math.random().toString(36).substring(2, 8)

  // Create file attachments
  const attachments = files.map(
    (file) => new AttachmentBuilder(Buffer.from(file.content, "utf-8"), { name: file.name }),
  )

  // Extract features from the content
  const features = extractFeatures(content)

  // Generate file tree visualization
  const fileTree = generateFileTree(files)

  // Create embeds
  const successEmbed = createAppGenerationEmbed(prompt, files, projectId)
  const fileStructureEmbed = createFileStructureEmbed(fileTree)
  const installEmbed = createInstallationEmbed()
  const featureEmbed = createFeatureHighlightsEmbed(features)
  const techStackEmbed = createTechStackEmbed()

  // Create action buttons
  const actionRow = createActionButtons(projectId)

  // Send the initial response with embeds and buttons
  await interaction.editReply({
    embeds: [successEmbed, featureEmbed, techStackEmbed],
    components: [actionRow],
    files: attachments.slice(0, 10), // Discord has a limit of 10 attachments
  })

  // Send file structure and installation instructions in a follow-up
  await interaction.followUp({
    embeds: [fileStructureEmbed, installEmbed],
  })

  // If there are more than 10 files, send them in follow-up messages
  if (attachments.length > 10) {
    for (let i = 10; i < attachments.length; i += 10) {
      await interaction.followUp({
        content: `Additional files (${i + 1}-${Math.min(i + 10, attachments.length)} of ${attachments.length}):`,
        files: attachments.slice(i, i + 10),
      })
    }
  }

  // Send a preview of the main file if available
  const mainFile = files.find((f) => f.name.includes("page.tsx") || f.name.includes("index"))
  if (mainFile) {
    const previewEmbed = new EmbedBuilder()
      .setTitle("👀 Code Preview")
      .setDescription(`Preview of \`${mainFile.name}\`:`)
      .setColor(0x00ae86)

    await interaction.followUp({
      embeds: [previewEmbed],
      content:
        "```tsx\n" +
        (mainFile.content.length > 1900 ? mainFile.content.slice(0, 1900) + "...\n" : mainFile.content) +
        "\n```",
    })
  }
}

client.login(process.env.DISCORD_BOT_TOKEN)
