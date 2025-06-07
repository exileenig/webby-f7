# Discord v0 Bot

A Discord bot that generates web applications using the v0 API.

## Features

- `/generate-app` slash command
- Support for text prompts and image attachments
- Generates complete Next.js applications
- Returns downloadable files
- Error handling and user feedback

## Setup

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" > "URL Generator"
6. Select scopes: `bot`, `applications.commands`
7. Select permissions: `Send Messages`, `Use Slash Commands`
8. Use the generated URL to add bot to your server

### 2. v0 API Setup

1. Sign up for v0 Premium or Team plan at [v0.dev](https://v0.dev)
2. Generate an API key from your v0 dashboard
3. Copy the API key

### 3. Installation

1. Clone this repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create `.env` file with your tokens:
   \`\`\`env
   DISCORD_BOT_TOKEN=your_discord_bot_token
   V0_API_KEY=your_v0_api_key
   \`\`\`
4. Start the bot:
   \`\`\`bash
   npm start
   \`\`\`

## Usage

In Discord, use the slash command:
\`\`\`
/generate-app prompt: Create a pharmacy website
\`\`\`

With images:
\`\`\`
/generate-app prompt: Recreate this design image1: [attach screenshot]
\`\`\`

## Example Prompts

- "Create a todo app with dark mode"
- "Build a restaurant website with menu and reservations"
- "Make a dashboard for a fitness app"
- "Generate a blog with authentication"

## File Structure

\`\`\`
discord-v0-bot/
├── bot.js              # Main bot file
├── services/
│   └── v0-service.js   # v0 API integration
├── utils/
│   └── formatter.js    # Response formatting
├── package.json
├── .env
└── README.md
\`\`\`

## Error Handling

The bot handles:
- v0 API rate limits
- Invalid prompts
- Image processing errors
- Discord message limits
- Network timeouts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
\`\`\`

Finally, let's create a simple deployment script:
