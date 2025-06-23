import Image from "next/image";
import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo/logoverde.webp"
                alt="Padelnity - Red Social de Pádel"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Padelnity
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Características
              </a>
              <a href="#community" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Comunidad
              </a>
              <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Contacto
              </a>
            </nav>
            <div className="flex space-x-4">
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                Iniciar Sesión
              </Button>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              La Red Social
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                del Pádel
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conecta con jugadores, encuentra clubs, comparte experiencias y mejora tu juego. 
              La comunidad de pádel más grande está aquí.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8 py-4">
                Comenzar Ahora
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-4">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas para tu pádel
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Desde encontrar compañeros de juego hasta reservar pistas, Padelnity tiene todo lo que necesitas.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Encuentra Jugadores</h4>
                <p className="text-gray-600">Conecta con jugadores de tu nivel y zona para partidos regulares</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Clubs & Pistas</h4>
                <p className="text-gray-600">Descubre clubs cerca de ti y reserva pistas fácilmente</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justice-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Mejora tu Juego</h4>
                <p className="text-gray-600">Estadísticas, entrenamientos y consejos para llevar tu juego al siguiente nivel</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              ¿Listo para elevar tu pádel?
            </h3>
            <p className="text-xl text-emerald-100 mb-8">
              Únete a miles de jugadores que ya forman parte de la comunidad Padelnity
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-50 text-lg px-8 py-4">
              Crear Cuenta Gratis
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image
                src="/logo/logoverde.webp"
                alt="Padelnity Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-semibold text-gray-900">Padelnity</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2025 Padelnity. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
