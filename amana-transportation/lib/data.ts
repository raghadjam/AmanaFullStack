import { notFound } from 'next/navigation';

// --- Interface Definitions ---

// API-side coordinates interface (latitude/longitude)
export interface ApiCoordinates {
    latitude: number;
    longitude: number;
    address?: string;
}

// Normalized coordinate interface (lat/lng) used by Leaflet
export interface NormalizedCoordinates {
    lat: number;
    lng: number;
}

// API-side definition of a single route stop
export interface ApiRouteStop {
    id: number;
    name: string;
    estimated_arrival: string; 
    latitude: number;
    longitude: number;
    is_next_stop: boolean; 
}

// API-side definition of an incident
export interface Incident {
    id: number;
    type: string;
    description: string;
    reported_by: string;
    reported_time: string;
    status: string;
    priority: string;
    bus_id: number; // Added during normalization
    bus_name: string; // Added during normalization
}

// Normalized RouteStop (simplified for component use)
export interface RouteStop {
    name: string;
    time: string;
    coords: NormalizedCoordinates;
}

// API-side definition of the bus line payload
export interface ApiBusLine {
    id: number;
    name: string; 
    status: string;
    current_location: ApiCoordinates;
    passengers: {
        current: number;
        capacity: number;
        utilization_percentage: number;
    };
    bus_stops: ApiRouteStop[];
    incidents: Incident[];
    route_number: string;
}

// Normalized Bus Data (used by BusMap and BusSchedule components)
export interface BusData {
    id: string; // e.g., "Bus 1"
    name: string; // Route Name
    route_number: string;
    status: string; 
    capacity: number; // Utilization Percentage
    current_location: NormalizedCoordinates;
    next_stop_name: string;
    route: RouteStop[];
}

// API-side operational summary
export interface OperationalSummary {
    total_buses: number;
    active_buses: number;
    maintenance_buses: number;
    total_capacity: number;
    current_passengers: number;
    average_utilization: number;
}

// Combined data structure returned by the fetch function
export interface TransportationData {
    buses: BusData[];
    summary: OperationalSummary;
    allIncidents: Incident[];
}

// --- Data Fetching Logic ---

// Use the local proxy defined in next.config.ts to avoid CORS issues
const API_URL = "/api/amana/amana-transportation"; 

export async function getAmanaTransportationData(): Promise<TransportationData> {
    try {
        // Use a cache-busting method for development/real-time use
        const response = await fetch(API_URL, { cache: 'no-store' });
        
        if (!response.ok) {
            console.error(`API response failed with status: ${response.status}`);
            // If the API fails, we can either throw, or return default empty data.
            // For stability, we return an empty dataset.
            return {
                buses: [],
                summary: { total_buses: 0, active_buses: 0, maintenance_buses: 0, total_capacity: 0, current_passengers: 0, average_utilization: 0 },
                allIncidents: []
            };
        }
        
        const rawData: any = await response.json();
        
        // --- Data Extraction and Normalization ---
        const busLines: ApiBusLine[] = rawData.bus_lines || [];
        const operationalSummary: OperationalSummary = rawData.operational_summary || {};
        const allIncidents: Incident[] = [];

        const normalizedData: BusData[] = busLines.map((line, index) => {
            
            // Find the next stop name using 'is_next_stop' property
            const nextStop = line.bus_stops.find(stop => stop.is_next_stop);

            // Consolidate incidents for the dashboard
            line.incidents.forEach(incident => {
                allIncidents.push({
                    ...incident,
                    bus_id: line.id,
                    bus_name: line.name
                });
            });
            
            return {
                id: `Bus ${index + 1}`, // Simple display ID
                name: line.name,
                route_number: line.route_number,
                status: line.status,
                // Capacity is mapped to Utilization Percentage for display clarity
                capacity: line.passengers.utilization_percentage, 
                
                // Normalize coordinates for Leaflet
                current_location: { 
                    lat: line.current_location.latitude, 
                    lng: line.current_location.longitude 
                },
                
                next_stop_name: nextStop ? nextStop.name : 'Unknown',
                
                // Map API stops to the simpler RouteStop structure
                route: line.bus_stops.map(stop => ({
                    name: stop.name,
                    time: stop.estimated_arrival, 
                    coords: { 
                        lat: stop.latitude, 
                        lng: stop.longitude 
                    }
                }))
            };
        });
        
        return {
            buses: normalizedData,
            summary: operationalSummary,
            allIncidents: allIncidents
        };
        
    } catch (error) {
        console.error("Failed to fetch or process transportation data:", error);
        // If fetch fails entirely (network error), return empty data
        return {
            buses: [],
            summary: { total_buses: 0, active_buses: 0, maintenance_buses: 0, total_capacity: 0, current_passengers: 0, average_utilization: 0 },
            allIncidents: []
        };
    }
}