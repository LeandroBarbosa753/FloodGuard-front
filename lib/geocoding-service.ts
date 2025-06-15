interface GeocodeResult {
  latitude: number
  longitude: number
  formatted_address: string
}

export class GeocodingService {
  // Simulação de geocodificação (em produção, usar Google Maps API, OpenStreetMap, etc.)
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Banco de dados simulado de localizações conhecidas
      const knownLocations: Record<string, GeocodeResult> = {
        "rio tietê": {
          latitude: -23.5505,
          longitude: -46.6333,
          formatted_address: "Rio Tietê, São Paulo, SP",
        },
        "rio pinheiros": {
          latitude: -23.5629,
          longitude: -46.6544,
          formatted_address: "Rio Pinheiros, São Paulo, SP",
        },
        "marginal tietê": {
          latitude: -23.5505,
          longitude: -46.6333,
          formatted_address: "Marginal Tietê, São Paulo, SP",
        },
        "marginal pinheiros": {
          latitude: -23.5629,
          longitude: -46.6544,
          formatted_address: "Marginal Pinheiros, São Paulo, SP",
        },
        "ponte das bandeiras": {
          latitude: -23.5398,
          longitude: -46.6122,
          formatted_address: "Ponte das Bandeiras, São Paulo, SP",
        },
        "ponte octavio frias": {
          latitude: -23.5745,
          longitude: -46.689,
          formatted_address: "Ponte Octavio Frias de Oliveira, São Paulo, SP",
        },
        "são paulo": {
          latitude: -23.5505,
          longitude: -46.6333,
          formatted_address: "São Paulo, SP, Brasil",
        },
        centro: {
          latitude: -23.5505,
          longitude: -46.6333,
          formatted_address: "Centro, São Paulo, SP",
        },
        "vila madalena": {
          latitude: -23.5505,
          longitude: -46.6875,
          formatted_address: "Vila Madalena, São Paulo, SP",
        },
        brooklin: {
          latitude: -23.6108,
          longitude: -46.7022,
          formatted_address: "Brooklin, São Paulo, SP",
        },
      }

      // Normalizar endereço para busca
      const normalizedAddress = address.toLowerCase().trim()

      // Buscar correspondência exata
      if (knownLocations[normalizedAddress]) {
        return knownLocations[normalizedAddress]
      }

      // Buscar correspondência parcial
      for (const [key, location] of Object.entries(knownLocations)) {
        if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
          return location
        }
      }

      // Se não encontrar, retornar coordenadas padrão de São Paulo com variação aleatória
      const baseLat = -23.5505
      const baseLng = -46.6333
      const variation = 0.05 // ~5km de variação

      return {
        latitude: baseLat + (Math.random() - 0.5) * variation,
        longitude: baseLng + (Math.random() - 0.5) * variation,
        formatted_address: `${address}, São Paulo, SP`,
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error)
      return null
    }
  }

  // Geocodificação reversa (coordenadas para endereço)
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Verificar se está próximo de localizações conhecidas
      const knownLocations = [
        { lat: -23.5505, lng: -46.6333, name: "Rio Tietê, São Paulo, SP" },
        { lat: -23.5629, lng: -46.6544, name: "Rio Pinheiros, São Paulo, SP" },
        { lat: -23.5398, lng: -46.6122, name: "Ponte das Bandeiras, São Paulo, SP" },
      ]

      for (const location of knownLocations) {
        const distance = Math.sqrt(Math.pow(latitude - location.lat, 2) + Math.pow(longitude - location.lng, 2))

        if (distance < 0.01) {
          // ~1km de tolerância
          return location.name
        }
      }

      // Retornar endereço genérico baseado nas coordenadas
      return `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, São Paulo, SP`
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error)
      return null
    }
  }

  // Obter localização atual do usuário
  static async getCurrentLocation(): Promise<GeocodeResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const address = await this.reverseGeocode(latitude, longitude)

          resolve({
            latitude,
            longitude,
            formatted_address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          })
        },
        (error) => {
          console.error("Erro ao obter localização:", error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutos
        },
      )
    })
  }
}
