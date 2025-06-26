'use client'

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, ChevronDown, Loader2, Wifi, WifiOff } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Types
interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface FloatingChatProps {
  context?: string
}

// Configuration
const CHAT_CONFIG = {
  welcomeMessage: "¡Hola! 👋 Soy el asistente de **Padelnity**. Estoy aquí para ayudarte con cualquier pregunta sobre el registro, inicio de sesión o cualquier duda que tengas. ¿En qué puedo ayudarte?",
  placeholder: "Escribe tu mensaje...",
  apiEndpoint: "/api/chat",
  scrollThreshold: 100,
  scrollTimeout: 5000,
  defaultHeight: 800,
  errors: {
    network: "Lo siento, hubo un problema con la conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.",
    fallback: "Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?"
  }
} as const

// Custom hooks
const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(0)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight
      setViewportHeight(height)
    }
    
    updateHeight()
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight)
      return () => window.visualViewport?.removeEventListener('resize', updateHeight)
    } else {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [])
  
  return viewportHeight
}

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}

// Memoized Components
const MessageBubble = memo(({ message, isBot }: { message: Message; isBot: boolean }) => {
  const bubbleClasses = useMemo(() => {
    const baseClasses = "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-lg"
    const botClasses = "bg-white/95 backdrop-blur-sm text-gray-800 border border-white/20"
    const userClasses = "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
    const alignClasses = isBot ? "self-start" : "self-end"
    
    return `${baseClasses} ${isBot ? botClasses : userClasses} ${alignClasses}`
  }, [isBot])

  const StatusIndicator = memo(() => {
    if (isBot || !message.status) return null
    
    const statusIcons = {
      sending: <Loader2 className="w-3 h-3 animate-spin text-emerald-300 ml-2" />,
      error: <span className="text-red-300 ml-2 text-xs">✗</span>,
      sent: <span className="text-emerald-300 ml-2 text-xs">✓</span>
    }
    
    return statusIcons[message.status] || null
  })

  StatusIndicator.displayName = 'StatusIndicator'

  const formattedTime = useMemo(() => 
    message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [message.timestamp]
  )

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={bubbleClasses}>
        {isBot ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-emerald-600">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-700">
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-200 pl-3 italic">{children}</blockquote>
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-end">
            <span>{message.content}</span>
            <StatusIndicator />
          </div>
        )}
        <div className={`text-xs mt-2 ${isBot ? 'text-gray-500' : 'text-emerald-100'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'

const ChatHeader = memo(({ onClose, isOnline }: { onClose: () => void; isOnline: boolean }) => (
  <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/20 bg-white/95 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-sm">
        <MessageCircle className="w-4 h-4 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">Asistente Padelnity</h3>
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-700">En línea</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600">Sin conexión</span>
            </>
          )}
        </div>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="w-8 h-8 p-0 hover:bg-white/50 rounded-full text-gray-700 hover:text-gray-900"
      aria-label="Cerrar chat"
    >
      <X className="w-4 h-4" />
    </Button>
  </div>
))

ChatHeader.displayName = 'ChatHeader'

const ScrollToBottomButton = memo(({ onClick, show, unreadCount }: { 
  onClick: () => void; 
  show: boolean; 
  unreadCount: number 
}) => (
  <div
    className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ease-out z-30 ${
      show ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    <div className="relative group">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
      
      <Button
        onClick={onClick}
        size="sm"
        className="relative w-9 h-9 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 backdrop-blur-sm"
        aria-label="Ir al final"
      >
        <ChevronDown className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform duration-200" />
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-white/10 to-white/5 pointer-events-none"></div>
      </Button>
      
      {unreadCount > 0 && show && (
        <div className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5 shadow-lg animate-in zoom-in duration-200">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
      
      <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-110 group-active:opacity-0 transition-all duration-300 pointer-events-none"></div>
    </div>
  </div>
))

ScrollToBottomButton.displayName = 'ScrollToBottomButton'

export default function FloatingChat({ context = "auth" }: FloatingChatProps) {
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Custom hooks
  const viewportHeight = useViewportHeight()
  const isOnline = useNetworkStatus()

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: CHAT_CONFIG.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }])
    }
  }, [messages.length])

  // Auto-scroll logic
  const scrollToBottom = useCallback((force = false) => {
    if (!messagesEndRef.current) return
    
    if (force || !userHasScrolled) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [userHasScrolled])

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < CHAT_CONFIG.scrollThreshold
    
    setUserHasScrolled(!isNearBottom)
    setShowScrollButton(!isNearBottom && messages.length > 2)
    
    if (isNearBottom) {
      setUnreadCount(0)
    }
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setUserHasScrolled(false)
      setUnreadCount(0)
    }, CHAT_CONFIG.scrollTimeout)
  }, [messages.length])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      
      if (userHasScrolled && lastMessage?.isBot) {
        setUnreadCount(prev => prev + 1)
      } else {
        scrollToBottom()
        setUnreadCount(0)
      }
    }
  }, [messages, scrollToBottom, userHasScrolled])

  // Handle chat toggle
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
    
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !isOnline) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch(CHAT_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context
        })
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const data = await response.json()
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ))

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || CHAT_CONFIG.errors.fallback,
        isBot: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      
    } catch {
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ))
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: CHAT_CONFIG.errors.network,
        isBot: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, isOnline, context])

  // Handle input key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // Memoized styles
  const chatContainerStyle = useMemo(() => {
    const height = viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : CHAT_CONFIG.defaultHeight)
    return {
      height: `${height}px`,
      maxHeight: `${height}px`,
      background: 'linear-gradient(to bottom right, rgb(16 185 129), rgb(5 150 105), rgb(13 148 136))'
    }
  }, [viewportHeight])

  // Render floating button
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          aria-label="Abrir chat de ayuda"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  // Render full chat interface
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-500/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-sm">
      <div 
        className="w-full rounded-t-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-lg"
        style={chatContainerStyle}
      >
        <ChatHeader onClose={toggleChat} isOnline={isOnline} />
        
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 backdrop-blur-sm"
          style={{ height: 'calc(100% - 140px)' }}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isBot={message.isBot} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={CHAT_CONFIG.placeholder}
                disabled={isLoading || !isOnline}
                className="resize-none min-h-[46px] max-h-[120px] text-base border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !isOnline}
              className="min-h-[46px] h-full px-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <ScrollToBottomButton
        onClick={() => scrollToBottom(true)}
        show={showScrollButton}
        unreadCount={unreadCount}
      />
    </div>
  )
} 