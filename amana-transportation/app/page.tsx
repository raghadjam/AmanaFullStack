'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAmanaTransportationData, BusData, TransportationData, OperationalSummary, Incident } from '../lib/data';
import dynamic from 'next/dynamic';
import { Clock, Users, Wrench, TrafficCone, ShieldAlert } from 'lucide-react';

// Dynamically import the map component (mandatory for Leaflet in Next.js)
const BusMap = dynamic(() => import('../components/BusMap'), { ssr: false });

// Initial state for data fetching
const INITIAL_DATA: TransportationData = {
    buses: [],
    summary: { total_buses: 0, active_buses: 0, maintenance_buses: 0, total_capacity: 0, current_passengers: 0, average_utilization: 0 },
    allIncidents: []
};

// --- Sub-Components (for clean rendering) ---

/**
 * Renders the high-level operational metrics.
 */
const OperationalSummaryCard: React.FC<{ summary: OperationalSummary }> = ({ summary }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-xl border border-gray-100">
        <MetricItem 
            title="Total Buses" 
            value={summary.total_buses} 
            color="text-indigo-600" 
            bgColor="bg-indigo-50"
        />
        <MetricItem 
            title="Active" 
            value={summary.active_buses} 
            color="text-green-600" 
            bgColor="bg-green-50"
        />
        <MetricItem 
            title="In Maintenance" 
            value={summary.maintenance_buses} 
            color="text-yellow-600" 
            bgColor="bg-yellow-50"
        />
        <MetricItem 
            title="Avg. Utilization" 
            value={`${Math.round(summary.average_utilization)}%`} 
            color="text-blue-600" 
            bgColor="bg-blue-50"
        />
    </div>
);

/**
 * Helper component for displaying a single metric tile.
 */
const MetricItem: React.FC<{ title: string; value: string | number; color: string; bgColor: string }> = ({ title, value, color, bgColor }) => (
    <div className={`p-3 rounded-xl flex flex-col justify-center items-center ${bgColor} transition duration-300 hover:shadow-md`}>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-gray-500 mt-1">{title}</div>
    </div>
);


/**
 * Renders a list of current incidents across all bus lines.
 */
const IncidentsDashboard: React.FC<{ incidents: Incident[] }> = ({ incidents }) => {
    if (incidents.length === 0) {
        return (
            <div className="p-4 bg-green-50 rounded-lg text-center text-green-700 border border-green-200">
                <ShieldAlert className="w-5 h-5 inline mr-2"/> All systems operational. No active incidents.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {incidents.map((incident) => (
                <div key={`${incident.bus_id}-${incident.id}`} className="bg-white p-3 rounded-lg shadow-sm border border-red-200 flex justify-between items-start transition duration-200 hover:shadow-md">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center text-sm font-semibold text-gray-700">
                            <ShieldAlert className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                            Incident on Bus: {incident.bus_id} ({incident.bus_name})
                        </div>
                        <p className="text-xs text-red-600 mt-1 truncate">{incident.type} | Reported: {incident.reported_time}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{incident.description}</p>
                    </div>
                    <span className={`ml-4 px-2 py-0.5 text-xs rounded-full font-medium ${incident.priority === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                        {incident.priority}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * Renders the detailed schedule table for the selected bus.
 */
const BusSchedule: React.FC<{ bus: BusData }> = ({ bus }) => {
    
    // Function to find the next stop based on the closest future time
    const findNextStop = (route: BusData['route']) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

        let nextStop = null;
        let minDiff = Infinity;

        for (const stop of route) {
            if (stop.time === 'N/A') continue;

            // Parse time string (e.g., "14:20")
            const [hour, minute] = stop.time.split(':').map(Number);
            const stopTime = hour * 60 + minute;

            let diff = stopTime - currentTime;

            // Handle stops in the past for the current route cycle (diff > 0 is future stop)
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextStop = stop;
            }
        }
        return nextStop;
    };

    const nextStop = findNextStop(bus.route);
    const hasActiveRoute = bus.status === 'Active' && bus.route.some(stop => stop.time !== 'N/A');

    if (!hasActiveRoute) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg shadow-inner">
                <Wrench className="w-6 h-6 mx-auto mb-2" />
                <p>This bus is currently {bus.status.toLowerCase()} and has no active route schedule.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Arrival</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bus.route.map((stop, index) => {
                        const isNext = stop.name === nextStop?.name;
                        return (
                            <tr 
                                key={index} 
                                className={isNext ? 'bg-green-50 font-semibold' : 'hover:bg-gray-50'}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                    {isNext && <Clock className="w-4 h-4 text-green-600 mr-2" />}
                                    {stop.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stop.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {stop.time === 'N/A' ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Inactive
                                        </span>
                                    ) : isNext ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Next Stop
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            En Route
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- Main Component ---

export default function HomePage() {
    const [transportationData, setTransportationData] = useState<TransportationData>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filter the bus data for the currently selected bus
    const selectedBus = useMemo(() => {
        return transportationData.buses.find(bus => bus.id === selectedBusId);
    }, [transportationData.buses, selectedBusId]);

    // Function to fetch data and handle loading state
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAmanaTransportationData();
            setTransportationData(data);
            
            // Set the first active bus as selected by default
            if (data.buses.length > 0 && !selectedBusId) {
                const firstActiveBus = data.buses.find(bus => bus.status === 'Active');
                setSelectedBusId(firstActiveBus ? firstActiveBus.id : data.buses[0].id);
            }

        } catch (e) {
            console.error('Error fetching transportation data:', e);
            setError('Failed to load data. Please check network connection.');
            setTransportationData(INITIAL_DATA); 
        } finally {
            setLoading(false);
        }
    }, [selectedBusId]);

    // Initial load and periodic refresh
    useEffect(() => {
        fetchData();
        // Set up refresh interval (e.g., every 30 seconds)
        const intervalId = setInterval(fetchData, 30000); 
        return () => clearInterval(intervalId);
    }, [fetchData]);


    if (loading && transportationData.buses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-lg text-indigo-600">Loading live transportation data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg m-4">
                <h2 className="text-xl font-bold">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Amana Transportation Tracker</h1>
                <p className="text-lg text-gray-500">Real-time Bus Locations and Operational Status (Last Updated: {new Date().toLocaleTimeString()})</p>
            </header>
            
            {/* New Operational Dashboard Section */}
            <section className="mb-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-700 border-b pb-2 flex items-center">
                    <ShieldAlert className="w-6 h-6 mr-2 text-indigo-600" /> Operational Dashboard
                </h2>
                <OperationalSummaryCard summary={transportationData.summary} />
                <IncidentsDashboard incidents={transportationData.allIncidents} />
            </section>

            {/* Bus Selection and Map/Schedule View */}
            <section>
                <h2 className="text-2xl font-bold text-gray-700 border-b pb-2 mb-6">
                    Route Monitoring
                </h2>

                {/* Bus Selector Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 p-2 bg-white rounded-lg shadow-inner">
                    {transportationData.buses.map((bus) => (
                        <button
                            key={bus.id}
                            onClick={() => setSelectedBusId(bus.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                                selectedBusId === bus.id
                                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } ${bus.status === 'Maintenance' ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={bus.status === 'Maintenance'}
                        >
                            {bus.id} ({bus.route_number})
                        </button>
                    ))}
                </div>

                {selectedBus && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Map View */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                Live Location: {selectedBus.name} ({selectedBus.status})
                            </h3>
                            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg h-[400px]">
                                <BusMap bus={selectedBus} />
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm text-sm text-gray-700">
                                Current Route: <span className="font-medium text-indigo-600">{selectedBus.name}</span> | 
                                Utilization: <span className={`font-medium ${selectedBus.capacity > 80 ? 'text-red-600' : 'text-green-600'}`}>{selectedBus.capacity}%</span>
                            </div>
                        </div>

                        {/* Schedule View */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-600" /> Route Schedule
                            </h3>
                            <BusSchedule bus={selectedBus} />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}