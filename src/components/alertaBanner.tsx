import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { AlertTriangle } from "lucide-react";

export default function AlertaBanner() {
  return (
    <div className="w-full mb-6">
      <Alert className="w-full rounded-lg bg-yellow-100 border-yellow-400 text-yellow-800">
        <AlertTriangle className="w-12 h-12 mr-4 text-yellow-500" />
        <div>
          <AlertTitle className="font-bold text-yellow-900">Atención</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Recarga la pagina o haz click en Recargar para ver los cambios reflejados.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}