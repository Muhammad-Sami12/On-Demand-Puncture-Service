
import { ServiceType } from './types';
import { Disc, CircleDot, Truck } from 'lucide-react';
import React from 'react';

export const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  [ServiceType.TUBE_PATCH]: React.createElement(Disc, { size: 20 }),
  [ServiceType.TUBELESS_PLUG]: React.createElement(CircleDot, { size: 20 }),
  [ServiceType.TOW]: React.createElement(Truck, { size: 20 }),
};

export const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  [ServiceType.TUBE_PATCH]: "Patching a punctured inner tube.",
  [ServiceType.TUBELESS_PLUG]: "Plugging a tubeless tire externally.",
  [ServiceType.TOW]: "Towing to the nearest garage.",
};
