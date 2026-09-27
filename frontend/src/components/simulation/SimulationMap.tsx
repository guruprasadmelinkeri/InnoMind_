import React from 'react';
import { Navigation, Building2, Zap, Radio } from 'lucide-react';
import type { Hospital } from '../../types/hospital';
import type { HospitalRecommendation } from '../../types/allocation';
import type { ScenarioConfig } from './ScenarioControls';

interface SimulationMapProps {
  scenario: ScenarioConfig;
  hospitals: Hospital[];
  recommendations: HospitalRecommendation[];
  selectedHospitalId: number | null;
  onSelectHospitalNode: (hospitalId: number) => void;
  isLoading?: boolean;
}

export const SimulationMap: React.FC<SimulationMapProps> = ({
  scenario,
  hospitals,
  recommendations,
  selectedHospitalId,
  onSelectHospitalNode,
  isLoading = false,
}) => {
  // Map geographical bounds to SVG grid (San Francisco Area bounding box)
  const MIN_LAT = 37.755;
  const MAX_LAT = 37.790;
  const MIN_LNG = -122.435;
  const MAX_LNG = -122.410;

  const getCoordinates = (lat: number, lng: number) => {
    // Clamp to bounding box
    const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
    const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng));

    // Convert to percentage position on canvas
    const x = ((clampedLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    // Latitude inverted for SVG Y coordinate
    const y = ((MAX_LAT - clampedLat) / (MAX_LAT - MIN_LAT)) * 100;

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(88, y)),
    };
  };

  const incidentPos = getCoordinates(scenario.latitude, scenario.longitude);

  // Find top recommended hospital or user selected hospital
  const topRec = recommendations.length > 0 ? recommendations[0] : null;
  const targetHospitalId = selectedHospitalId || (topRec ? topRec.hospital_id : null);
  const targetHospitalObj = hospitals.find((h) => h.id === targetHospitalId);
  const targetRecObj = recommendations.find((r) => r.hospital_id === targetHospitalId);

  const targetPos = targetHospitalObj
    ? getCoordinates(Number(targetHospitalObj.latitude), Number(targetHospitalObj.longitude))
    : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between min-h-[440px]">
      {/* Simulation Header */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Dispatch & Geographic Route Simulation
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>REAL-TIME GRID SCAN</span>
        </div>
      </div>

      {/* Main Tactical Map Grid Area */}
      <div className="relative flex-1 w-full rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden min-h-[360px] flex items-center justify-center">
        {/* Subtle EOC Tactical Grid Lines Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Radar Scanning Line Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent animate-pulse" />

        {/* SVG Route Line connecting Incident and Recommended Hospital */}
        {targetPos && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Glowing route backdrop path */}
            <line
              x1={`${incidentPos.x}%`}
              y1={`${incidentPos.y}%`}
              x2={`${targetPos.x}%`}
              y2={`${targetPos.y}%`}
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-pulse"
              opacity="0.8"
            />
          </svg>
        )}

        {/* Midpoint Travel ETA Marker */}
        {targetPos && targetRecObj && (
          <div
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${(incidentPos.x + targetPos.x) / 2}%`,
              top: `${(incidentPos.y + targetPos.y) / 2}%`,
            }}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-sky-500/50 text-[10px] font-mono font-bold text-sky-300 shadow-xl backdrop-blur-md">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{targetRecObj.estimated_travel_minutes} MIN ETA</span>
              <span className="text-slate-500">({targetRecObj.distance_km} km)</span>
            </div>
          </div>
        )}

        {/* Incident Location Node (Emergency Scene) */}
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${incidentPos.x}%`, top: `${incidentPos.y}%` }}
        >
          {/* Pulsing Radar Ring */}
          <span className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
          <span className="absolute -inset-6 rounded-full border border-rose-500/30 animate-pulse" />

          {/* Pin Icon */}
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-xl shadow-rose-600/40 border border-rose-400/50 flex items-center justify-center">
            <Navigation className="w-4 h-4 fill-current transform rotate-45" />
          </div>

          {/* Incident Info Label */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 bg-slate-900/95 border border-rose-500/40 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>INCIDENT: {scenario.title}</span>
          </div>
        </div>

        {/* Hospital Location Nodes */}
        {hospitals.map((hospital) => {
          const pos = getCoordinates(Number(hospital.latitude), Number(hospital.longitude));
          const rec = recommendations.find((r) => r.hospital_id === hospital.id);
          const isRankOne = topRec?.hospital_id === hospital.id;
          const isSelected = targetHospitalId === hospital.id;
          const isOffline = hospital.status === 'Offline';

          return (
            <div
              key={hospital.id}
              onClick={() => onSelectHospitalNode(hospital.id)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Highlight Ring for Selected Destination */}
              {isSelected && (
                <span className="absolute -inset-3 rounded-full bg-sky-500/30 animate-pulse border border-sky-400/60" />
              )}

              {/* Hospital Node Button */}
              <div
                className={`relative p-2.5 rounded-2xl border transition-all duration-200 shadow-xl flex items-center justify-center ${
                  isRankOne
                    ? 'bg-gradient-to-br from-sky-600 to-indigo-700 text-white border-sky-300 shadow-sky-500/30 scale-110'
                    : isOffline
                    ? 'bg-slate-900 border-slate-800 text-slate-600'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {isRankOne && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-rose-500 text-white font-mono text-[9px] font-black rounded-full shadow-md">
                    #1
                  </span>
                )}
              </div>

              {/* Hospital Label Badge */}
              <div
                className={`absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 px-2.5 py-1 rounded-xl text-[10px] font-bold border shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-sky-500/80 shadow-sky-500/20'
                    : 'bg-slate-950/90 text-slate-300 border-slate-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOffline
                      ? 'bg-slate-500'
                      : !rec || !rec.eligible
                      ? 'bg-rose-500'
                      : isRankOne
                      ? 'bg-sky-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>{hospital.name}</span>
                {rec && (
                  <span className="font-mono text-slate-400 font-semibold border-l border-slate-800 pl-1">
                    {rec.estimated_travel_minutes}m
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-2 text-white">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono font-bold text-rose-300">Recalculating Deterministic Engine...</span>
          </div>
        )}
      </div>

      {/* Simulation Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-semibold text-slate-400 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Recommended #1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Eligible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Ineligible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Offline</span>
          </div>
        </div>

        <span className="font-mono text-[10px] text-slate-400">
          GIS Coordinates: San Francisco Bay Area Engine Grid
        </span>
      </div>
    </div>
  );
};
