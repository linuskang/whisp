type DiscordEmbed = {
  title?: string
  description?: string
  url?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string; icon_url?: string }
  author?: { name: string; url?: string; icon_url?: string }
  timestamp?: string
}

type DiscordMessagePayload = {
  username?: string
  avatar_url?: string
  content?: string
  embeds?: DiscordEmbed[]
}

export async function discordLog(
  embed: DiscordEmbed,
  options?: { username?: string; avatar_url?: string; content?: string }
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not defined in environment variables")
  }

  const payload: DiscordMessagePayload = {
    ...options,
    embeds: [embed],
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord webhook error: ${res.status} ${res.statusText} - ${text}`)
  }

  return { status: res.status, statusText: res.statusText }
}