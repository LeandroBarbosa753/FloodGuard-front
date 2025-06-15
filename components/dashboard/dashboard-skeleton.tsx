export function DashboardSkeleton() {
  return (
    <div className="h-80 w-full animate-pulse bg-muted/50 rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Carregando dados...</p>
    </div>
  )
}
