import {ArrowRight, Clock, DollarSign, Navigation} from "lucide-react"
import {Card} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {getTransportMode} from "@/components/common/TransportIcons.tsx"

interface ConnectionSegment {
    from: string
    to: string
    mode: string
    cost: number
    duration: number
    distance: number
}

interface ConnectionCardProps {
    segments: ConnectionSegment[]
    totalCost: number
    totalDuration: number
    totalDistance: number
    layovers: number
}

export function ConnectionCard({segments, totalCost, totalDuration, totalDistance, layovers}: ConnectionCardProps) {
    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4">
                {/* Connection Path */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {segments.map((segment, index) => {
                        const transport = getTransportMode(segment.mode)
                        const Icon = transport.icon
                        return (
                            <div key={index} className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{segment.from}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>

                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent">
                                    <div className={`p-1 rounded ${transport.color}`}>
                                        <Icon className="h-3 w-3 text-white"/>
                                    </div>

                                    <span className="text-xs font-medium text-accent-foreground">
                    ${segment.cost} • {segment.duration}min • {segment.distance}km
                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                            </div>
                        )
                    })}
                    <span className="font-medium text-foreground">{segments[segments.length - 1]?.to}</span>
                </div>

                {/* Total Stats */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <DollarSign className="h-4 w-4 text-primary"/>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Cost</p>
                            <p className="text-sm font-semibold text-foreground">${totalCost}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Clock className="h-4 w-4 text-primary"/>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-semibold text-foreground">{totalDuration} min</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Navigation className="h-4 w-4 text-primary"/>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="text-sm font-semibold text-foreground">{totalDistance} km</p>
                        </div>
                    </div>

                    <Badge variant="secondary" className="ml-auto">
                        {layovers} {layovers === 1 ? "Layover" : "Layovers"}
                    </Badge>
                </div>
            </div>
        </Card>
    )
}
