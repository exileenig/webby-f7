import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function deploy() {
  console.log("🚀 Deploying Discord v0 Bot...")

  try {
    // Install dependencies
    console.log("📦 Installing dependencies...")
    await execAsync("npm install")

    // Check environment variables
    if (!process.env.DISCORD_BOT_TOKEN || !process.env.V0_API_KEY) {
      throw new Error("Missing required environment variables")
    }

    console.log("✅ Environment variables found")
    console.log("🤖 Starting bot...")

    // Start the bot
    await execAsync("npm start")
  } catch (error) {
    console.error("❌ Deployment failed:", error.message)
    process.exit(1)
  }
}

deploy()
