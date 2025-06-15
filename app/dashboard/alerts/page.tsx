import { AlertForm } from "@/components/dashboard/alert-form"

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurar alerta</h1>
        <p className="text-muted-foreground">Configure alertas para níveis de água específicos.</p>
      </div>

      <AlertForm />
    </div>
  )
}
