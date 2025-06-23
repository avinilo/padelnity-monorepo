'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MessageCircle, Send, Bot, User, HelpCircle, Zap, Phone, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { memo, useMemo, useCallback, useState, useEffect, useRef, useLayoutEffect } from "react"
import ReactMarkdown from 'react-markdown'
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// ===== TYPES =====
interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
}

// ===== CONFIGURATION =====
const HELP_CONFIG = {
  botName: 'Asistente Padelnity',
  welcomeMessage: '¡Hola! Soy tu asistente virtual de **Padelnity**, potenciado por **TerretaCode**. Estoy aquí para ayudarte con cualquier duda sobre:\n\n• **Torneos de pádel** y participación\n• **Registro** y verificación de cuenta\n• **Problemas técnicos** de la plataforma\n• **Uso general** de la aplicación\n\n¿En qué puedo ayudarte hoy? 🎾',
  placeholderText: 'Escribe tu pregunta aquí...',
  quickActions: [
    {
      id: 'registration',
      title: 'Registro y Cuenta',
      description: 'Ayuda con registro, verificación y gestión de cuenta',
      icon: User,
      prompt: '¿Cómo puedo registrarme en Padelnity y verificar mi cuenta?'
    },
    {
      id: 'tournaments',
      title: 'Torneos de Pádel',
      description: 'Información sobre participación en torneos',
      icon: Zap,
      prompt: '¿Cómo puedo participar en un torneo de pádel?'
    },
    {
      id: 'technical',
      title: 'Problemas Técnicos',
      description: 'Soporte técnico y resolución de problemas',
      icon: HelpCircle,
      prompt: 'Tengo un problema técnico con la aplicación'
    }
  ]
} as const

// ===== CUSTOM HOOKS =====
const useAutoScroll = (messages: ChatMessage[], isLoading: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const lastMessageCountRef = useRef(messages.length)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (shouldAutoScroll || force)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: force ? 'instant' : 'smooth',
        block: 'end'
      })
    }
  }, [shouldAutoScroll])

  useLayoutEffect(() => {
    const hasNewMessages = messages.length > lastMessageCountRef.current
    lastMessageCountRef.current = messages.length

    if (hasNewMessages && shouldAutoScroll && !userHasScrolled) {
      scrollToBottom(false)
    }
    
    if (isLoading && shouldAutoScroll && !userHasScrolled) {
      scrollToBottom(false)
    }
  }, [messages, isLoading, scrollToBottom, shouldAutoScroll, userHasScrolled])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
      
      if (!isNearBottom) {
        setUserHasScrolled(true)
        setShouldAutoScroll(false)
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setUserHasScrolled(false)
        }, 3000)
      } else {
        setShouldAutoScroll(true)
        setUserHasScrolled(false)
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }
  }, [])

  const scrollToBottomManually = useCallback(() => {
    setShouldAutoScroll(true)
    setUserHasScrolled(false)
    scrollToBottom(true)
  }, [scrollToBottom])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return { 
    messagesEndRef, 
    containerRef, 
    handleScroll, 
    scrollToBottomManually,
    shouldAutoScroll,
    userHasScrolled 
  }
}

const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: HELP_CONFIG.welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const history = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          history: history
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.fallbackMessage || 'Error en la respuesta del servidor')
      }

      const data = await response.json()
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
          } catch (error) {
        // Error en chat
      
      let errorContent = 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo o contacta con nuestro soporte técnico.'
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorContent = 'Problema de conexión. Verifica tu internet e inténtalo de nuevo.'
        } else if (error.message.includes('saturado')) {
          errorContent = 'El servicio está temporalmente saturado. Por favor, inténtalo en unos minutos.'
        } else if (error.message.includes('no disponible')) {
          errorContent = 'Servicio temporalmente no disponible. Puedes contactar directamente con soporte técnico.'
        }
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages])

  const handleQuickAction = useCallback((prompt: string) => {
    sendMessage(prompt)
  }, [sendMessage])

  return {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
    handleQuickAction
  }
}

// ===== MEMOIZED COMPONENTS =====
const ChatHeader = memo(({ isKeyboardOpen }: { isKeyboardOpen: boolean }) => (
  <div className={`flex-shrink-0 border-b border-gray-200 bg-white ${isKeyboardOpen ? 'px-4 py-3' : 'px-6 py-4'}`}>
    <div className="flex items-center justify-center mb-3">
      <Image
        src="/logo/logoverde.webp"
        alt="Padelnity - Logo"
        width={140}
        height={70}
        className="w-auto h-auto object-contain max-w-[140px] max-h-[70px] sm:max-w-[160px] sm:max-h-[80px]"
        priority
      />
    </div>
    <div className="flex items-center justify-center space-x-3">
      <div className="p-2 bg-emerald-100 rounded-full">
        <MessageCircle className={`text-emerald-600 ${isKeyboardOpen ? 'h-5 w-5' : 'h-6 w-6'}`} />
      </div>
      <div className="text-center">
        <h1 className={`font-bold text-gray-900 ${isKeyboardOpen ? 'text-lg' : 'text-xl'}`}>
          Centro de Ayuda
        </h1>
        {!isKeyboardOpen && (
          <p className="text-sm text-gray-600">Potenciado por TerretaCode</p>
        )}
      </div>
    </div>
  </div>
))

ChatHeader.displayName = 'ChatHeader'

const QuickActionButton = memo(({ action, onAction, isCompact }: { 
  action: QuickAction
  onAction: (prompt: string) => void
  isCompact: boolean
}) => {
  const IconComponent = action.icon

  return (
    <Button
      variant="outline"
      onClick={() => onAction(action.prompt)}
      className={`h-auto text-left border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 ${
        isCompact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="flex items-start space-x-2 w-full">
        <div className={`bg-emerald-100 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
          <IconComponent className={`text-emerald-600 ${isCompact ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-gray-900 ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {action.title}
          </h4>
          {!isCompact && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{action.description}</p>
          )}
        </div>
      </div>
    </Button>
  )
})

QuickActionButton.displayName = 'QuickActionButton'

const MessageBubble = memo(({ message }: { message: ChatMessage }) => {
  const isBot = message.sender === 'bot'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
            isBot ? 'bg-emerald-100' : 'bg-teal-100'
          }`}>
            {isBot ? (
              <Bot className="w-4 h-4 text-emerald-600" />
            ) : (
              <User className="w-4 h-4 text-teal-600" />
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
            isBot 
              ? 'bg-white border border-gray-200 text-gray-900' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
          }`}>
            {isBot ? (
              <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-emerald">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-emerald-700">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-800 underline font-medium"
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-emerald-200 pl-4 italic text-emerald-700 my-2">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
          <p className={`text-xs px-2 ${
            isBot ? 'text-gray-400' : 'text-gray-500'
          } ${isBot ? 'text-left' : 'text-right'}`}>
            {message.timestamp.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

const TypingIndicator = memo(() => (
  <div className="flex justify-start mb-4 animate-fade-in">
    <div className="flex flex-row">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
))

TypingIndicator.displayName = 'TypingIndicator'

const ChatInput = memo(({ 
  value, 
  onChange, 
  onSubmit, 
  disabled, 
  placeholder 
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }, [onSubmit])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }, [onSubmit])

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 h-11 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors"
          disabled={disabled}
          maxLength={500}
        />
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          className="h-11 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-sm disabled:opacity-50 transition-all duration-200"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

const NavigationButton = memo(() => (
  <div className="mb-4 text-center">
    <Link 
      href="/" 
      className="inline-flex items-center text-sm sm:text-base text-white hover:text-emerald-100 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded transition-colors"
      aria-label="Volver a la página principal"
    >
      <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
      Volver al registro
    </Link>
  </div>
))

NavigationButton.displayName = 'NavigationButton'

const TechnicalSupportLink = memo(() => (
  <div className="flex-shrink-0 p-4 bg-emerald-50 border-t border-emerald-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Phone className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-900">¿Problemas técnicos?</p>
          <p className="text-xs text-emerald-700">Contacta con nuestro equipo especializado</p>
        </div>
      </div>
      <Link href="/contact">
        <Button 
          size="sm" 
          variant="outline" 
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1 h-auto"
        >
          Contactar
        </Button>
      </Link>
    </div>
  </div>
))

TechnicalSupportLink.displayName = 'TechnicalSupportLink'

// ===== MAIN COMPONENT =====
export default function HelpCenterClient() {
  const isKeyboardVisible = useKeyboardDetection()
  const {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
    handleQuickAction
  } = useChatbot()

  const { messagesEndRef, containerRef, handleScroll, scrollToBottomManually, shouldAutoScroll, userHasScrolled } = useAutoScroll(messages, isLoading)

  const handleSubmit = useCallback(() => {
    sendMessage(inputValue)
  }, [inputValue, sendMessage])

  const containerClasses = useMemo(() => 
    `min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 py-3 px-3 sm:py-4 sm:px-4 ${
      isKeyboardVisible ? 'pb-2' : ''
    }`,
    [isKeyboardVisible]
  )

  const chatHeight = useMemo(() => 
    isKeyboardVisible ? 'h-[75vh]' : 'h-[85vh] sm:h-[80vh]',
    [isKeyboardVisible]
  )

  return (
    <div className={containerClasses}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <NavigationButton />

        <Card className={`shadow-xl border-0 ${chatHeight} flex flex-col overflow-hidden`} style={{ backgroundColor: '#F4FAF7' }}>
          <ChatHeader isKeyboardOpen={isKeyboardVisible} />

          {/* Quick Actions */}
          {!isKeyboardVisible && (
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {HELP_CONFIG.quickActions.map((action) => (
                  <QuickActionButton
                    key={action.id}
                    action={action}
                    onAction={handleQuickAction}
                    isCompact={isKeyboardVisible}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div 
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 space-y-2"
              onScroll={handleScroll}
              style={{ scrollBehavior: 'smooth' }}
            >
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-1" />
            </div>
            
            {/* Botón flotante para volver al final */}
            {userHasScrolled && !shouldAutoScroll && (
              <button
                onClick={scrollToBottomManually}
                className="absolute bottom-4 right-4 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 flex items-center justify-center group"
                aria-label="Ir al final del chat"
              >
                <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
              </button>
            )}
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={isLoading}
            placeholder={HELP_CONFIG.placeholderText}
          />

          <TechnicalSupportLink />
        </Card>
      </div>
    </div>
  )
} 