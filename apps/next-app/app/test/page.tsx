export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Prueba de Tailwind CSS
        </h1>
        <p className="text-gray-700">
          Si ves este texto con estilos, Tailwind funciona correctamente.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 font-semibold">
            ✅ Estilos aplicados correctamente
          </p>
        </div>
      </div>
    </div>
  )
} 