import type { FC } from "react"
import { Home, ArrowLeft, Search } from "lucide-react"

const NotFound: FC = () => {
  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          {/* 404 Number */}
          <div className="text-8xl sm:text-9xl font-bold text-indigo-600 opacity-80">404</div>

          {/* Main heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Página no encontrada</h1>

          {/* Description */}
          <p className="text-gray-600 text-base sm:text-lg">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
              <Search className="w-16 h-16 text-indigo-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver atrás
          </button>

          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al inicio
          </button>
        </div>

        {/* Additional help text */}
        <div className="pt-8">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?
            <a href="/contacto" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
