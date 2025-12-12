import {FC, useState, useEffect} from 'react';
import {ConnectionCard} from "@/components/common/ConnectionCard.tsx"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Checkbox} from "@/components/ui/checkbox"
import {transportModes} from "@/components/common/TransportIcons.tsx"
import {Search} from "lucide-react"
import axios from "axios";

interface HomeProps {
}

export const Home: FC<HomeProps> = () => {
    const backend_href = "https://cloud-computing-37u6.onrender.com";

    const [cities, setCities] = useState<{ id: string, name: string }[]>([]);
    const [filteredStart, setFilteredStart] = useState<any[]>([]);
    const [filteredDest, setFilteredDest] = useState<any[]>([]);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        startInput: "",
        startId: "",
        destinationInput: "",
        destinationId: "",
        modes: [] as string[],
        maxCost: "",
        maxTime: "",
        maxDistance: "",
        sort: "time",
    });

    const [isSearching, setIsSearching] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`${backend_href}/api/cities`)
            .then(res => setCities(res.data))
            .catch(err => console.error("Error loading cities", err));
    }, []);


    const filterCities = (input: string) =>
        cities.filter(c =>
            c.name.toLowerCase().includes(input.toLowerCase()) ||
            c.id.toLowerCase().includes(input.toLowerCase())
        );

    const handleStartInput = (value: string) => {
        setFormData(prev => ({...prev, startInput: value, startId: ""}));
        setFilteredStart(filterCities(value));
    };

    const handleDestInput = (value: string) => {
        setFormData(prev => ({...prev, destinationInput: value, destinationId: ""}));
        setFilteredDest(filterCities(value));
    };

    const selectStart = (city: any) => {
        setFormData(prev => ({
            ...prev,
            startInput: city.name,
            startId: city.id
        }));
        setFilteredStart([]);
    };

    const selectDest = (city: any) => {
        setFormData(prev => ({
            ...prev,
            destinationInput: city.name,
            destinationId: city.id
        }));
        setFilteredDest([]);
    };

    const handleModeToggle = (mode: string) => {
        setFormData(prev => ({
            ...prev,
            modes: prev.modes.includes(mode)
                ? prev.modes.filter(m => m !== mode)
                : [...prev.modes, mode]
        }));
    };

    const handleSearch = async () => {
        // if (!formData.startId || !formData.destinationId) {
        //     alert("Please choose valid cities from the dropdown.");
        //     return;
        // }

        setError("");

        if (!formData.startId || !formData.destinationId) {
            setError("Please choose valid cities from the dropdown.");
            return;
        }

        setIsSearching(true);
        setConnections([]);

        try {
            const params = new URLSearchParams();
            params.append("from", formData.startId);
            params.append("to", formData.destinationId);

            if (formData.modes.length > 0)
                params.append("transport", formData.modes.join(","));

            if (formData.maxCost) params.append("maxCost", formData.maxCost);
            if (formData.maxTime) params.append("maxTime", formData.maxTime);
            if (formData.maxDistance) params.append("maxDistance", formData.maxDistance);
            if (formData.sort) params.append("sort", formData.sort);


            const res = await axios.get(
                `${backend_href}/api/routes?${params.toString()}`
            );

            const mapped = res.data.map((r: any) => ({
                segments: r.connections.map((c: any) => ({
                    from: r.nodes.find((n: any) => n.id === c.from)?.name ?? c.from,
                    to: r.nodes.find((n: any) => n.id === c.to)?.name ?? c.to,
                    mode: c.transport,
                    cost: c.cost.low ?? c.cost,
                    duration: c.time.low ?? c.time,
                    distance: c.distance.low ?? c.distance,
                })),
                totalCost: r.total.cost,
                totalDuration: r.total.time,
                totalDistance: r.total.distance,
                layovers: r.connections.length - 1
            }));

            setConnections(mapped);
        } catch (err) {
            console.error(err);
        }

        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Find Your Perfect
                        Route</h1>
                    <p className="text-lg text-muted-foreground text-balance">
                        Search across multiple transport modes to discover the most efficient connections for your
                        journey
                    </p>
                </div>

                {/* Hero Image */}
                {/*<div className="mb-12 rounded-2xl overflow-hidden shadow-lg">*/}
                {/*    <img src="/scenic-travel-landscape-with-mountains-and-roads.jpg" alt="Travel landscape"*/}
                {/*         className="w-full h-[400px] object-cover"/>*/}
                {/*</div>*/}

                {/* Search Form */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                        <h2 className="text-2xl font-semibold mb-6 text-foreground">Search Connections</h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* START */}
                            <div className="space-y-2 relative">
                                <Label>Starting Location</Label>
                                <Input
                                    placeholder="Type city name..."
                                    value={formData.startInput}
                                    onChange={(e) => handleStartInput(e.target.value)}
                                    className="h-12"
                                />
                                {filteredStart.length > 0 && (
                                    <div
                                        className="absolute z-10 bg-card border border-border rounded-xl mt-1 w-full shadow-lg max-h-60 overflow-y-auto">
                                        {filteredStart.map(city => (
                                            <div
                                                key={city.id}
                                                className="p-2 hover:bg-accent cursor-pointer"
                                                onClick={() => selectStart(city)}
                                            >
                                                {city.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DESTINATION */}
                            <div className="space-y-2 relative">
                                <Label>Destination</Label>
                                <Input
                                    placeholder="Type city name..."
                                    value={formData.destinationInput}
                                    onChange={(e) => handleDestInput(e.target.value)}
                                    className="h-12"
                                />
                                {filteredDest.length > 0 && (
                                    <div
                                        className="absolute z-10 bg-card border border-border rounded-xl mt-1 w-full shadow-lg max-h-60 overflow-y-auto">
                                        {filteredDest.map(city => (
                                            <div
                                                key={city.id}
                                                className="p-2 hover:bg-accent cursor-pointer"
                                                onClick={() => selectDest(city)}
                                            >
                                                {city.name} <span
                                                className="text-xs text-muted-foreground">({city.id})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 space-y-3">
                                <Label>Transport Modes</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {transportModes.map((mode) => {
                                        const Icon = mode.icon
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
                                        )
                                    })}
                                </div>
                            </div>

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

                            <div className="space-y-2">
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

                            <div className="space-y-2">
                                <Label htmlFor="sort">Sort By</Label>
                                <select
                                    id="sort"
                                    value={formData.sort}
                                    onChange={(e) => setFormData({...formData, sort: e.target.value})}
                                    className="h-12 w-full border border-border rounded-md bg-background px-3"
                                >
                                    <option value="time">Total Time</option>
                                    <option value="cost">Total Cost</option>
                                    <option value="distance">Total Distance</option>
                                </select>
                            </div>

                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-4">{error}</p>
                        )}

                        <Button onClick={handleSearch} disabled={isSearching} className="w-full mt-8 h-12 text-base"
                                size="lg">
                            <Search className="mr-2 h-5 w-5"/>
                            {isSearching ? "Searching..." : "Search Connections"}
                        </Button>
                    </div>
                </div>

                {/* RESULTS */}
                {!isSearching && connections.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-6 text-foreground">Available Connections</h2>
                        <div className="space-y-4">
                            {connections.map((connection, index) => (
                                <ConnectionCard key={index} {...connection} />
                            ))}
                        </div>
                    </div>
                )}

                {/* NO RESULTS FOUND */}
                {!isSearching && connections.length === 0 && (formData.startId || formData.destinationId) && (
                    <div className="max-w-4xl mx-auto text-center mt-10 text-muted-foreground">
                        <p className="text-lg">
                            No connections found for the given parameters.
                        </p>
                    </div>
                )}

                {/* Features Section */}
                {/*<div className="mt-20 grid md:grid-cols-3 gap-8">*/}
                {/*    <div className="text-center">*/}
                {/*        <div className="mb-4 rounded-2xl overflow-hidden">*/}
                {/*            <img src="/multiple-transportation-modes.jpg" alt="Multiple modes"*/}
                {/*                 className="w-full h-48 object-cover"/>*/}
                {/*        </div>*/}
                {/*        <h3 className="text-lg font-semibold mb-2 text-foreground">Multi-Modal Search</h3>*/}
                {/*        <p className="text-muted-foreground text-sm">*/}
                {/*            Combine planes, trains, buses, and more to find the best route*/}
                {/*        </p>*/}
                {/*    </div>*/}

                {/*    <div className="text-center">*/}
                {/*        <div className="mb-4 rounded-2xl overflow-hidden">*/}
                {/*            <img src="/cost-savings-travel.jpg" alt="Best prices" className="w-full h-48 object-cover"/>*/}
                {/*        </div>*/}
                {/*        <h3 className="text-lg font-semibold mb-2 text-foreground">Best Prices</h3>*/}
                {/*        <p className="text-muted-foreground text-sm">Compare costs across different routes to save*/}
                {/*            money</p>*/}
                {/*    </div>*/}

                {/*    <div className="text-center">*/}
                {/*        <div className="mb-4 rounded-2xl overflow-hidden">*/}
                {/*            <img src="/fast-travel-connections.jpg" alt="Fast connections"*/}
                {/*                 className="w-full h-48 object-cover"/>*/}
                {/*        </div>*/}
                {/*        <h3 className="text-lg font-semibold mb-2 text-foreground">Smart Routing</h3>*/}
                {/*        <p className="text-muted-foreground text-sm">*/}
                {/*            Optimize for time, cost, or distance based on your preferences*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </main>
        </div>
    );
};
