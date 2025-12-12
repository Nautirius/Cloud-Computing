import { Plane, Train, Bus, Ship, Car, Bike } from "lucide-react"

export const transportModes = [
    { value: "plane", label: "Plane", icon: Plane, color: "bg-sky-500", textColor: "text-sky-700" },
    { value: "train", label: "Train", icon: Train, color: "bg-blue-600", textColor: "text-blue-700" },
    { value: "bus", label: "Bus", icon: Bus, color: "bg-amber-500", textColor: "text-amber-700" },
    { value: "ship", label: "Ship", icon: Ship, color: "bg-teal-600", textColor: "text-teal-700" },
    { value: "car", label: "Car", icon: Car, color: "bg-slate-600", textColor: "text-slate-700" },
    { value: "bike", label: "Bike", icon: Bike, color: "bg-green-600", textColor: "text-green-700" },
]

export function getTransportMode(value: string) {
    return transportModes.find((mode) => mode.value === value) || transportModes[0]
}
