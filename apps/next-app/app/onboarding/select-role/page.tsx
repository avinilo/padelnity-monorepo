'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building, ArrowRight } from 'lucide-react'

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole === 'player') {
      router.push('/onboarding/player-setup')
    } else if (selectedRole === 'business') {
      router.push('/onboarding/club-setup')
    }
  }

  const getRoleText = () => {
    if (selectedRole === 'player') {
      return {
        title: 'Perfil de Jugador',
        description: 'Busco otros jugadores, clubs donde jugar, torneos y quiero mejorar mi nivel de pádel'
      }
    } else if (selectedRole === 'business') {
      return {
        title: 'Perfil de Negocio',
        description: 'Soy propietario de un club, tienda, academia o cualquier negocio relacionado con el pádel'
      }
    }
    return {
      title: 'Selecciona tu tipo de perfil',
      description: 'Para personalizar tu experiencia, elige una de las opciones'
    }
  }

  const roleText = getRoleText()

  return (
    <div className="min-h-screen bg-[#10b981] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Tarjeta única con todo el contenido */}
        <Card className="shadow-2xl border-0 bg-white">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Logo y encabezado dentro de la tarjeta */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <Image
                  src="/logo/logoverde.webp"
                  alt="Padelnity Logo"
                  width={120}
                  height={60}
                  className="h-12 sm:h-16"
                  style={{ width: "auto" }}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                ¡Bienvenido a Padelnity!
              </h1>
            </div>

            {/* Iconos de selección */}
            <div className="flex justify-center space-x-8 sm:space-x-12 mb-6 sm:mb-8">
              {/* Opción Jugador */}
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-110 ${ 
                  selectedRole === 'player' ? 'scale-110' : ''
                }`}
                onClick={() => setSelectedRole('player')}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'player' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                  <User size={32} className="sm:w-10 sm:h-10" />
                </div>
                <p className={`text-center mt-2 sm:mt-3 font-medium text-sm sm:text-base transition-colors duration-300 ${
                  selectedRole === 'player' ? 'text-emerald-600' : 'text-gray-600'
                }`}>
                  Jugador
                </p>
              </div>

              {/* Opción Negocio */}
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-110 ${ 
                  selectedRole === 'business' ? 'scale-110' : ''
                }`}
                onClick={() => setSelectedRole('business')}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'business' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                  <Building size={32} className="sm:w-10 sm:h-10" />
                </div>
                <p className={`text-center mt-2 sm:mt-3 font-medium text-sm sm:text-base transition-colors duration-300 ${
                  selectedRole === 'business' ? 'text-emerald-600' : 'text-gray-600'
                }`}>
                  Negocio
                </p>
              </div>
            </div>

            {/* Texto dinámico */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 transition-all duration-300">
                {roleText.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg px-2 sm:px-0">
                {roleText.description}
              </p>
            </div>

            {/* Botón de continuar */}
            <div className="text-center mb-4 sm:mb-6">
              <Button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] sm:min-h-[56px] text-base sm:text-lg"
              >
                {selectedRole ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      Continuar como {selectedRole === 'player' ? 'Jugador' : 'Negocio'}
                    </span>
                    <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </div>
                ) : (
                  'Selecciona una opción para continuar'
                )}
              </Button>
            </div>

            {/* Enlaces de ayuda */}
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-gray-500">
                ¿No estás seguro? {' '}
                <Link href="/help" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Consulta nuestra guía
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Podrás cambiar esto más tarde en la configuración de tu perfil
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 