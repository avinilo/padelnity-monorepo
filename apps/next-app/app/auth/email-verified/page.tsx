"use client"

import Image from "next/image"
import { CheckCircle2, Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 rounded-xl sm:rounded-2xl">
          <CardHeader className="text-center pt-8 pb-6 sm:pt-10 sm:pb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo/logoverde.webp"
                alt="Padelnity - Logo"
                width={160}
                height={80}
                className="w-auto h-auto object-contain max-w-[160px] max-h-[80px]"
                priority
              />
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              ¡Email Verificado!
            </h1>
          </CardHeader>
          
          <CardContent className="px-6 pb-8 sm:px-8 sm:pb-10">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
              <p className="text-emerald-800 text-lg sm:text-xl font-semibold leading-relaxed">
                Puedes cerrar esta ventana y continuar con el login
              </p>
              <p className="text-emerald-700 text-sm sm:text-base mt-3">
                Tu cuenta ya está lista para usar de forma segura
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 