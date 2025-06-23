import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Configuración del modelo
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  },
})

// Contextos específicos según la sección
const CONTEXTS = {
  auth: `
Eres el asistente virtual oficial de Padelnity, la plataforma líder de torneos de pádel en España. 

INFORMACIÓN SOBRE PADELNITY:
- Plataforma de registro y gestión de torneos de pádel
- Permite a jugadores registrarse, verificar cuentas y participar en torneos
- Ofrece diferentes categorías y niveles de competición
- Gestiona instalaciones deportivas y horarios
- Sistema de emparejamiento de jugadores y equipos

CONTEXTO ACTUAL: PÁGINAS DE AUTENTICACIÓN
El usuario está en las páginas de registro, login, verificación de email, cambio de contraseña, etc.

TEMAS QUE PUEDES AYUDAR EN ESTA SECCIÓN:
1. **Registro de cuenta**: Proceso paso a paso, requisitos, verificación
2. **Inicio de sesión**: Problemas de acceso, contraseñas olvidadas
3. **Verificación de email**: Cómo verificar, reenvío de emails
4. **Cambio de contraseña**: Proceso de recuperación y cambio
5. **Problemas técnicos**: Errores en formularios, navegadores compatibles
6. **Información general**: Qué es Padelnity, beneficios de registrarse

TU PERSONALIDAD:
- Amigable, profesional y entusiasta del pádel
- Respuestas claras y concisas para ayudar con el proceso de registro/login
- Siempre positivo y motivador
- Enfocado en resolver problemas de autenticación

INSTRUCCIONES:
- Responde SIEMPRE en español
- Mantén respuestas entre 50-200 palabras
- Usa emojis relacionados con pádel cuando sea apropiado: 🎾 🏆 🎯 ⚡ 🏟️
- Si no sabes algo específico, deriva al soporte técnico
- Sé proactivo sugiriendo acciones relacionadas con el registro/login
- FORMATO: Usa markdown para dar formato a tus respuestas:
  * **texto** para negritas en información importante
  * *texto* para cursivas en énfasis
  * • para listas de puntos
  * [texto](url) para enlaces cuando sea relevante
  * \`código\` para términos técnicos
`,
  dashboard: `
Eres el asistente virtual oficial de Padelnity, especializado en el dashboard de usuario.

CONTEXTO ACTUAL: DASHBOARD DE USUARIO
El usuario ya está autenticado y navega por su panel de control.

TEMAS QUE PUEDES AYUDAR EN ESTA SECCIÓN:
1. **Gestión de perfil**: Editar información personal, preferencias
2. **Torneos**: Inscripción, historial, próximos eventos
3. **Estadísticas**: Rendimiento, ranking, progreso
4. **Emparejamientos**: Búsqueda de compañeros, equipos
5. **Instalaciones**: Reservas, disponibilidad, ubicaciones
6. **Configuración**: Notificaciones, privacidad, cuenta

[Resto del contexto específico para dashboard...]
`
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    // Verificar API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY no está configurada')
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, history = [], context = 'auth' } = body

    // Validar entrada
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // Limitar longitud del mensaje
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Mensaje demasiado largo (máximo 500 caracteres)' },
        { status: 400 }
      )
    }

    // Obtener contexto específico
    const contextPrompt = CONTEXTS[context as keyof typeof CONTEXTS] || CONTEXTS.auth

    // Construir historial de conversación
    const conversationHistory = history
      .slice(-10) // Limitar a últimos 10 mensajes para contexto
      .map((msg: ChatMessage) => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
      .join('\n')

    // Construir prompt completo
    const fullPrompt = `
${contextPrompt}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

MENSAJE ACTUAL DEL USUARIO:
${message}

RESPUESTA (como asistente de Padelnity):
`

    // Generar respuesta con Gemini
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    // Validar respuesta
    if (!text || text.trim().length === 0) {
      throw new Error('Respuesta vacía del modelo')
    }

    // Limpiar y formatear respuesta
    const cleanedResponse = text
      .trim()
      .replace(/^(Asistente:|Respuesta:)/i, '') // Remover prefijos
      .trim()

    return NextResponse.json({
      response: cleanedResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en API de chat:', error)

    // Respuesta de fallback específica para diferentes tipos de error
    let fallbackMessage = 'Lo siento, ha ocurrido un error técnico. Por favor, inténtalo de nuevo en unos momentos.'
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        fallbackMessage = 'Servicio temporalmente no disponible. Contacta con soporte técnico.'
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        fallbackMessage = 'Servicio temporalmente saturado. Por favor, inténtalo en unos minutos.'
      }
    }

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        fallbackMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Manejar métodos no permitidos
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  )
} 