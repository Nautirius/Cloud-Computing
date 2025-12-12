import {FC, useState, useEffect} from 'react';
import {ConnectionCard} from "@/components/common/ConnectionCard.tsx"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {transportModes} from "@/components/common/TransportIcons.tsx"
import {Compass} from "lucide-react"
import axios from "axios";

interface ExploreProps {
}

export const Explore: FC<ExploreProps> = () => {
    const backend_href = "https://cloud-computing-37u6.onrender.com";

    const [formData, setFormData] = useState({
        start: "",
        startId: "",
        modes: [] as string[],
        maxCost: "",
        maxTime: "",
        maxDistance: "",
        maxLayovers: "",
    });

    const [destinations, setDestinations] = useState<any[]>([]);
    const [isExploring, setIsExploring] = useState(false);
    const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
    const [filteredCities, setFilteredCities] = useState<{ id: string; name: string }[]>([]);
    const [showStartDropdown, setShowStartDropdown] = useState(false);
    const [error, setError] = useState("");

    // Fetch all cities initially
    useEffect(() => {
        axios.get(`${backend_href}/api/cities`)
            .then(res => setCities(res.data))
            .catch(() => {
            });
    }, []);

    // Autocomplete filter
    const handleStartInput = (value: string) => {
        setFormData(prev => ({...prev, start: value, startId: ""}));

        if (!value.trim()) {
            setFilteredCities([]);
            return;
        }

        const filtered = cities.filter(city =>
            city.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredCities(filtered);
        setShowStartDropdown(filtered.length > 0);
    };

    const selectStartCity = (city: { id: string; name: string }) => {
        setFormData(prev => ({
            ...prev,
            start: city.name,
            startId: city.id
        }));
        setShowStartDropdown(false);
    };

    const handleModeToggle = (mode: string) => {
        setFormData(prev => ({
            ...prev,
            modes: prev.modes.includes(mode)
                ? prev.modes.filter(m => m !== mode)
                : [...prev.modes, mode],
        }));
    };

    const handleExplore = async () => {
        setError("");
        setDestinations([]);

        if (!formData.startId) {
            setError("Please select a valid starting city.");
            return;
        }

        setIsExploring(true);

        try {
            const params = new URLSearchParams({
                from: formData.startId,
            });

            if (formData.modes.length > 0) params.append("transport", formData.modes.join(","));
            if (formData.maxCost) params.append("maxCost", formData.maxCost);
            if (formData.maxTime) params.append("maxTime", formData.maxTime);
            if (formData.maxDistance) params.append("maxDistance", formData.maxDistance);
            if (formData.maxLayovers) params.append("maxLayovers", formData.maxLayovers);

            const res = await axios.get(`${backend_href}/api/explore?${params.toString()}`);

            const mapped = res.data.map((item: any) => {
                const segments = item.path.connections.map((c: any) => ({
                    from: cities.find((n: any) => n.id === c.from)?.name ?? c.from,
                    to: cities.find((n: any) => n.id === c.to)?.name ?? c.to,
                    mode: c.transport,
                    cost: c.cost.low,
                    duration: c.time.low,
                    distance: c.distance.low,
                }));

                return {
                    destination: item.destination,
                    segments,
                    totalCost: item.total.cost,
                    totalDuration: item.total.time,
                    totalDistance: item.total.distance,
                    layovers: segments.length - 1,
                };
            });

            setDestinations(mapped);

        } catch (err) {
            setError("Failed to load destinations.");
        }

        setIsExploring(false);
    };


    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Explore New
                        Destinations</h1>
                    <p className="text-lg text-muted-foreground text-balance">
                        Discover where you can travel from your starting point within your budget and time constraints
                    </p>
                </div>

                {/* Hero Image */}
                {/*<div className="mb-12 rounded-2xl overflow-hidden shadow-lg">*/}
                {/*    <img src="/world-map-with-travel-connections.jpg" alt="World map"*/}
                {/*         className="w-full h-[400px] object-cover"/>*/}
                {/*</div>*/}

                {/* Explore Form */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                        <h2 className="text-2xl font-semibold mb-6 text-foreground">Explore Destinations</h2>

                        <div className="grid gap-6">
                            {/* Start Location */}
                            <div className="relative space-y-2">
                                <Label htmlFor="start">Starting Location</Label>
                                <Input
                                    id="start"
                                    placeholder="Type city name..."
                                    value={formData.start}
                                    onChange={(e) => handleStartInput(e.target.value)}
                                    className="h-12"
                                />

                                {showStartDropdown && (
                                    <div
                                        className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-56 overflow-y-auto">
                                        {filteredCities.map((city) => (
                                            <div
                                                key={city.id}
                                                className="p-2 hover:bg-accent cursor-pointer"
                                                onClick={() => selectStartCity(city)}
                                            >
                                                {city.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Transport Modes */}
                            <div className="space-y-3">
                                <Label>Transport Modes</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {transportModes.map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <div
                                                key={mode.value}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                                                onClick={() => handleModeToggle(mode.value)}
                                            >
                                                <Checkbox
                                                    checked={formData.modes.includes(mode.value)}
                                                    onCheckedChange={() => handleModeToggle(mode.value)}
                                                />
                                                <div className={`p-1.5 rounded ${mode.color}`}>
                                                    <Icon className="h-4 w-4 text-white"/>
                                                </div>
                                                <span className="text-sm font-medium">{mode.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="maxCost">Max Cost ($)</Label>
                                    <Input
                                        id="maxCost"
                                        type="number"
                                        placeholder="Set limit..."
                                        value={formData.maxCost}
                                        onChange={(e) => setFormData({...formData, maxCost: e.target.value})}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxTime">Max Time (minutes)</Label>
                                    <Input
                                        id="maxTime"
                                        type="number"
                                        placeholder="Set limit..."
                                        value={formData.maxTime}
                                        onChange={(e) => setFormData({...formData, maxTime: e.target.value})}
                                        className="h-12"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="maxDistance">Max Distance (km)</Label>
                                    <Input
                                        id="maxDistance"
                                        type="number"
                                        placeholder="Set limit..."
                                        value={formData.maxDistance}
                                        onChange={(e) => setFormData({...formData, maxDistance: e.target.value})}
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-4">{error}</p>
                        )}

                        <Button
                            onClick={handleExplore}
                            disabled={isExploring}
                            className="w-full mt-8 h-12 text-base"
                            size="lg"
                        >
                            <Compass className="mr-2 h-5 w-5"/>
                            {isExploring ? "Exploring..." : "Explore Destinations"}
                        </Button>
                    </div>
                </div>

                {/* RESULTS - when destinations are found */}
                {!isExploring && destinations.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-6 text-foreground">Possible Destinations</h2>
                        <div className="space-y-4">
                            {destinations.map((destination, index) => (
                                <ConnectionCard key={index} {...destination} />
                            ))}
                        </div>
                    </div>
                )}

                {/* NO RESULTS FOUND */}
                {!isExploring &&
                    destinations.length === 0 &&
                    formData.start && ( // ensures user typed something first
                        <div className="max-w-4xl mx-auto text-center mt-10 text-muted-foreground">
                            <p className="text-lg">
                                No destinations found for the selected transport modes and filters.
                            </p>
                        </div>
                    )}

                {/* Inspiration Section */}
                {/*<div className="mt-20 grid md:grid-cols-2 gap-8">*/}
                {/*    <div className="rounded-2xl overflow-hidden shadow-lg">*/}
                {/*        <img src="/coastal-city-destination.jpg" alt="Coastal destination"*/}
                {/*             className="w-full h-64 object-cover"/>*/}
                {/*        <div className="p-6 bg-card">*/}
                {/*            <h3 className="text-xl font-semibold mb-2 text-foreground">Weekend Getaways</h3>*/}
                {/*            <p className="text-muted-foreground">Discover charming destinations within a few hours of*/}
                {/*                travel</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className="rounded-2xl overflow-hidden shadow-lg">*/}
                {/*        <img src="/mountain-adventure-destination.jpg" alt="Mountain destination"*/}
                {/*             className="w-full h-64 object-cover"/>*/}
                {/*        <div className="p-6 bg-card">*/}
                {/*            <h3 className="text-xl font-semibold mb-2 text-foreground">Adventure Travel</h3>*/}
                {/*            <p className="text-muted-foreground">Find exciting destinations for your next adventure</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </main>
        </div>
    );
};
