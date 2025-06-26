'use client'

import Link from "next/link"
import { ArrowLeft, MessageCircle, Send, Bot, User, HelpCircle, Phone, Loader2, ChevronDown, BookOpen, Trophy, FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useCallback, useState, useEffect, useRef } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// TypeScript Interfaces
interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface HelpConfig {
  lastUpdated: string
  contactEmail: string
  supportEmail: string
  botName: string
  companyName: string
}

// Configuration
const HELP_CONFIG: HelpConfig = {
  lastUpdated: new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  contactEmail: 'help@padelnity.com',
  supportEmail: 'support@padelnity.com',
  botName: 'Asistente Padelnity',
  companyName: 'Padelnity SL'
}

// Table of Contents Data
const TOC_ITEMS = [
  { id: 'getting-started', title: '1. Primeros Pasos' },
  { id: 'account-management', title: '2. Gestión de Cuenta' },
  { id: 'matches-tournaments', title: '3. Partidas y Torneos' },
  { id: 'chatbot', title: '4. Asistente Virtual' },
  { id: 'contact', title: '5. Contacto' }
] as const

// FAQ Data
const FAQ_DATA = {
  'getting-started': [
    {
      id: 'create-account',
      question: '¿Cómo creo una cuenta en Padelnity?',
      answer: 'Para crear tu cuenta: 1) Ve a la página principal, 2) Completa el formulario con tu email y contraseña, 3) Verifica tu email, 4) Completa tu perfil de jugador con tu nivel y preferencias.'
    },
    {
      id: 'verify-email',
      question: '¿Cómo verifico mi email?',
      answer: 'Después del registro, recibirás un email de verificación. Haz clic en el enlace del email para activar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.'
    },
    {
      id: 'complete-profile',
      question: '¿Cómo completo mi perfil de jugador?',
      answer: 'Ve a tu perfil y añade: foto, nivel de juego, ubicación preferida, horarios disponibles y cualquier información que ayude a otros jugadores a conocerte.'
    }
  ],
  'account-management': [
    {
      id: 'change-password',
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a Configuración > Seguridad > Cambiar contraseña. Ingresa tu contraseña actual y la nueva. Te recomendamos usar una contraseña segura con mayúsculas, números y símbolos.'
    },
    {
      id: 'update-profile',
      question: '¿Cómo actualizo mi información de perfil?',
      answer: 'Accede a tu perfil desde el menú principal, haz clic en "Editar perfil" y modifica la información que desees. No olvides guardar los cambios.'
    },
    {
      id: 'delete-account',
      question: '¿Cómo elimino mi cuenta?',
      answer: 'Ve a Configuración > Cuenta > Eliminar cuenta. Esta acción es irreversible y eliminará todos tus datos permanentemente. Tendrás 30 días para cancelar la eliminación.'
    }
  ],
  'matches-tournaments': [
    {
      id: 'join-tournament',
      question: '¿Cómo me uno a un torneo?',
      answer: 'Ve a la sección Torneos, busca el evento que te interese, revisa los requisitos y haz clic en "Inscribirse". Deberás completar el pago para confirmar tu participación.'
    },
    {
      id: 'create-match',
      question: '¿Cómo creo una partida?',
      answer: 'En la sección Partidas, haz clic en "Crear partida", selecciona fecha, hora, ubicación y nivel de juego. Otros jugadores podrán unirse según tus criterios.'
    },
    {
      id: 'find-players',
      question: '¿Cómo encuentro jugadores de mi nivel?',
      answer: 'Usa los filtros de búsqueda por nivel, ubicación y horarios. También puedes ver las estadísticas de otros jugadores para encontrar compañeros compatibles.'
    }
  ]
} as const

// Custom Hooks
const useScrollToSection = () => {
  return useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])
}

// Optimized Markdown Parser
const MarkdownText = memo(({ content, className = "" }: { content: string; className?: string }) => {
  const parseMarkdown = useCallback((text: string) => {
    const elements: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^\*\*(.*?)\*\*/)
      if (boldMatch) {
        elements.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      // Italic *text*
      const italicMatch = remaining.match(/^\*(.*?)\*/)
      if (italicMatch) {
        elements.push(<em key={key++} className="italic">{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        elements.push(
          <a 
            key={key++} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-800 underline"
          >
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      // Code `text`
      const codeMatch = remaining.match(/^`([^`]+)`/)
      if (codeMatch) {
        elements.push(
          <code key={key++} className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      // Regular character
      elements.push(remaining.charAt(0))
      remaining = remaining.slice(1)
      key++
    }

    return elements
  }, [])

  const renderLine = useCallback((line: string, index: number) => {
    // Handle emojis and special formatting
    if (line.match(/^[🎾👤🔧💳]/)) {
      return <div key={index} className="my-1 flex items-center">{parseMarkdown(line)}</div>
    }
    
    // Handle headers
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-bold mt-3 mb-1">{parseMarkdown(line.slice(4))}</h3>
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{parseMarkdown(line.slice(3))}</h2>
    }

    // Handle bullet points
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc">{parseMarkdown(line.slice(2))}</li>
    }

    // Regular text
    if (line.trim()) {
      return <div key={index} className="leading-relaxed">{parseMarkdown(line)}</div>
    }

    return <div key={index} className="h-2"></div>
  }, [parseMarkdown])

  return (
    <div className={className}>
      {content.split('\n').map(renderLine)}
    </div>
  )
})

MarkdownText.displayName = 'MarkdownText'

// Optimized Chatbot Hook
const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Inicializar mensaje de bienvenida solo en el cliente para evitar hidratación
  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: 'Hola! Soy tu asistente virtual de **Padelnity**.\n\nEstoy aqui para ayudarte con todo lo relacionado con nuestra plataforma:\n\n- **Torneos y partidas**\n- **Gestion de cuenta**\n- **Soporte tecnico**\n- **Pagos y suscripciones**\n\nEn que puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date()
      }])
      setIsInitialized(true)
    }
  }, [isInitialized, messages.length])

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    adjustTextareaHeight()
  }, [adjustTextareaHeight])

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
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Simulate API response con respuesta fija para evitar Math.random()
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Gracias por tu pregunta: "**${content}**"\n\nEsta es una respuesta simulada con *markdown* funcionando correctamente.\n\n## Caracteristicas:\n- **Negritas** funcionan\n- *Cursivas* tambien\n- [Enlaces externos](https://padelnity.com) son clicables\n- \`Codigo inline\` se ve bien\n\n### Proximos pasos:\nPuedes revisar nuestras **Preguntas Frecuentes** arriba o contactarnos directamente en [support@padelnity.com](mailto:support@padelnity.com).`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 1500)
  }, [isLoading])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }, [sendMessage, inputValue])

  useEffect(() => {
    adjustTextareaHeight()
  }, [adjustTextareaHeight])

  return { 
    messages, 
    inputValue,
    isLoading, 
    sendMessage, 
    handleInputChange, 
    handleKeyPress, 
    textareaRef 
  }
}

// Optimized Components
const HelpHeader = memo(() => (
  <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-50 to-teal-50">
    <div className="flex items-center justify-center mb-6">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg">
        <HelpCircle className="h-10 w-10 text-white" />
      </div>
    </div>
    <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
      Centro de Ayuda
    </CardTitle>
    <p className="text-gray-600 text-lg">
      Encuentra respuestas rápidas o chatea con nuestro asistente
    </p>
    <p className="text-sm text-gray-500 mt-4">
      Última actualización: {HELP_CONFIG.lastUpdated}
    </p>
  </CardHeader>
))

HelpHeader.displayName = 'HelpHeader'

const TableOfContents = memo(({ scrollToSection }: { scrollToSection: (id: string) => void }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
      <FileText className="h-5 w-5 text-emerald-600 mr-2" />
      Índice de Contenidos
    </h3>
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {TOC_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className="text-left text-sm text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 p-2 rounded transition-colors"
        >
          {item.title}
        </button>
      ))}
    </nav>
  </div>
))

TableOfContents.displayName = 'TableOfContents'

// Reusable FAQ Section Component
const FAQSection = memo(({ 
  id, 
  title, 
  icon: Icon, 
  description, 
  faqItems 
}: { 
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  faqItems: ReadonlyArray<{ readonly id: string; readonly question: string; readonly answer: string }>
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  return (
    <section id={id} className="scroll-mt-4 mb-8">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
      <div className="space-y-3">
        {faqItems.map((item) => (
          <Card key={item.id} className="border border-gray-200">
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{item.question}</span>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedItems.has(item.id) ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedItems.has(item.id) && (
              <div className="px-4 pb-4 text-gray-700 border-t border-gray-100">
                <p className="pt-3">{item.answer}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
})

FAQSection.displayName = 'FAQSection'

const ChatBotSection = memo(() => {
  const { messages, inputValue, isLoading, sendMessage, handleInputChange, handleKeyPress, textareaRef } = useChatbot()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasUserInteraction = useRef(false)

  useEffect(() => {
    // Solo hacer scroll automático si hay interacción del usuario y mensajes
    if (hasUserInteraction.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    hasUserInteraction.current = true
    sendMessage(inputValue)
  }, [sendMessage, inputValue])

  return (
    <section id="chatbot" className="scroll-mt-4 mb-8">
      <div className="flex items-center mb-4">
        <Bot className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">4. Asistente Virtual</h3>
      </div>
      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat en Tiempo Real
          </h4>
          <p className="text-emerald-800">
            Nuestro asistente virtual está disponible 24/7 para ayudarte con cualquier duda. 
            Pregunta sobre funcionalidades, reporta problemas o solicita asistencia.
          </p>
        </div>
        
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-3" />
              <div>
                <CardTitle className="text-lg">{HELP_CONFIG.botName}</CardTitle>
                <p className="text-emerald-100 text-sm">Asistente inteligente • En línea</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Iniciando asistente...</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start">
                        {message.sender === 'bot' && (
                          <Bot className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        {message.sender === 'user' && (
                          <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <MarkdownText 
                          content={message.content}
                          className="prose prose-sm max-w-none"
                        />
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs px-4 py-2 rounded-lg">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Escribiendo...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        hasUserInteraction.current = true
                      }
                      handleKeyPress(e)
                    }}
                    placeholder="Escribe..."
                    disabled={isLoading}
                    className="w-full min-h-[40px] max-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 scrollbar-hide"
                    rows={1}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-[46px] h-full px-4 py-4 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
})

ChatBotSection.displayName = 'ChatBotSection'

const NavigationLinks = memo(({ isKeyboardVisible }: { isKeyboardVisible: boolean }) => {
  if (isKeyboardVisible) return null

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link href="/" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Button>
      </Link>
      
      <Link href="/contact" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Contactar Soporte
        </Button>
      </Link>
      
      <Link href="/terms" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Términos y Condiciones
        </Button>
      </Link>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main Optimized Component
export default function HelpCenterClient() {
  const { isKeyboardVisible } = useKeyboardDetection()
  const scrollToSection = useScrollToSection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl border-0 overflow-hidden">
          <HelpHeader />
          
          <CardContent className="p-8">
            <TableOfContents scrollToSection={scrollToSection} />
            
            <div className="space-y-8">
              <FAQSection
                id="getting-started"
                title="1. Primeros Pasos"
                icon={BookOpen}
                description="Todo lo que necesitas saber para empezar a usar Padelnity y conectarte con la comunidad padelista."
                faqItems={FAQ_DATA['getting-started']}
              />
              
              <FAQSection
                id="account-management"
                title="2. Gestión de Cuenta"
                icon={User}
                description="Gestiona tu perfil, configuración de cuenta y preferencias de privacidad."
                faqItems={FAQ_DATA['account-management']}
              />
              
              <FAQSection
                id="matches-tournaments"
                title="3. Partidas y Torneos"
                icon={Trophy}
                description="Organiza y participa en partidas y torneos de pádel con otros jugadores."
                faqItems={FAQ_DATA['matches-tournaments']}
              />
              
              <ChatBotSection />
              
              {/* Contact Section */}
              <section id="contact" className="scroll-mt-4 mb-8">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">5. Contacto</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    Si no encuentras la respuesta que buscas, nuestro equipo está aquí para ayudarte:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Soporte General:</p>
                      <p className="text-emerald-600">{HELP_CONFIG.supportEmail}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Ayuda y FAQ:</p>
                      <p className="text-emerald-600">{HELP_CONFIG.contactEmail}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-900">Empresa:</p>
                    <p className="text-gray-700">{HELP_CONFIG.companyName}</p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <NavigationLinks isKeyboardVisible={isKeyboardVisible} />
      </div>
    </div>
  )
} 