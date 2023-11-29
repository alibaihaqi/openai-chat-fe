'use client'

import { OpenaiChatService } from '@/services/openai/chat'
import { ChangeEvent, useState } from 'react'

export default function SearchInput() {
  const [input, setInput] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const onChangeInputHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }

  const eventSourceHandler = () => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_DOMAIN}/openai/chat-streams`)

    const listener = ({ data }: { data: string }) => {
      const resp = JSON.parse(data)

      if (resp?.delta?.content) {
        setGeneratedText(prevText => prevText + resp?.delta?.content || '')
      }
    }
    eventSource.addEventListener('chat.completion.chunk', listener)

    eventSource.onerror = (error) => {
      console.log(error)
      eventSource.removeEventListener('chat.completion.chunk', listener)
      eventSource.close()
    }
  }

  const onClickButtonHandler = async () => {
    setIsButtonDisabled(true)
    setGeneratedText('')

    try {
      eventSourceHandler()
      await OpenaiChatService(input)
    } catch (error) {
      console.log(error)
    }
    setIsButtonDisabled(false)
  }

  const renderGeneratedAIResponse = () => {
    if (!generatedText) {
      return (<p className='text-sm'>Empty...</p>)
    }

    return (
      <p className='w-full sm:max-w-md whitespace-pre-wrap'>
        { generatedText }
      </p>
    )
  }

  return (
    <>
      <textarea
        className='w-full sm:max-w-md p-2 my-4 border rounded-lg'
        id="input"
        name="input-openai"
        rows={6}
        onChange={onChangeInputHandler}
        value={input}
      />
      
      <button
        className={`
          py-2 w-full sm:max-w-md rounded-md
          bg-blue-500 disabled:bg-gray-200 text-white hover:shadow-md
          hover:brightness-105 transition-shadow`
        }
        disabled={isButtonDisabled}
        onClick={onClickButtonHandler}
      >
        Submit
      </button>

      <h2 className='pt-8 pb-4 text-lg'>
        Generated OpenAI Chat Response
      </h2>

      { renderGeneratedAIResponse() }
    </>
  )
}
