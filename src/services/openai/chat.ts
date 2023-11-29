export const OpenaiChatService = async (input: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}/openai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stream: true,
      messages: [{ role: 'user', content: input }]
    }),
  })

  return response.json()
}
