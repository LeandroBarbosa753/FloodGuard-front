import { getServerSupabaseClient } from "@/lib/supabase/server"
import { LeafletMap } from "@/components/dashboard/leaflet-map"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function MapPage() {
  let sensors = []
  let reports = []
  let fetchError = null

  try {
    const supabase = getServerSupabaseClient()

    // Buscar sensores
    const { data: sensorData, error: sensorError } = await supabase
      .from("sensors")
      .select("*")
      .order("name", { ascending: true })

    if (sensorError) {
      console.error("Error fetching sensors:", sensorError)
      fetchError = `Error fetching sensors: ${sensorError.message}`
    } else {
      sensors = sensorData || []
    }

    // Buscar relatos
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (reportError) {
      console.error("Error fetching reports:", reportError)
      if (!fetchError) {
        fetchError = `Error fetching reports: ${reportError.message}`
      }
    } else {
      reports = reportData || []
    }
  } catch (error) {
    console.error("Exception in map page:", error)
    fetchError = "An unexpected error occurred. Please try again later."
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mapa</h1>
        <p className="text-muted-foreground">
          Visualize a localização dos sensores e relatos em um mapa interativo. Clique nos marcadores para mais
          informações.
        </p>
      </div>

      {fetchError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      ) : (
        <LeafletMap sensors={sensors} reports={reports} />
      )}
    </div>
  )
}
