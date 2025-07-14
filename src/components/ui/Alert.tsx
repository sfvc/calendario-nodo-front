import React from "react"
import { cn } from "../../lib/utils"

interface AlertProps {
  type?: "success" | "error" | "info"
  message: string
  onClose?: () => void
}

const baseStyles = "p-4 rounded-md border text-sm flex items-center justify-between shadow"

const typeStyles = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
}

export const Alert: React.FC<AlertProps> = ({ type = "info", message, onClose }) => {
  return (
    <div className={cn(baseStyles, typeStyles[type])}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-xs font-medium text-gray-600 hover:underline"
        >
          Cerrar
        </button>
      )}
    </div>
  )
}
