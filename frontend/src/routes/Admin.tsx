import {FC, useEffect, useState} from 'react';
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {MapPin, Plus, Trash2} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {transportModes} from "@/components/common/TransportIcons.tsx"
import axios from "axios";


interface AdminProps {
}

export const Admin: FC<AdminProps> = () => {
    const backend_href = "https://cloud-computing-37u6.onrender.com";

    const [cities, setCities] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    const [error, setError] = useState("");

    useEffect(() => {
        loadCities();
        loadConnections();
    }, []);

    const loadCities = async () => {
        const res = await axios.get(`${backend_href}/api/cities`);
        setCities(res.data);
    };

    const loadConnections = async () => {
        const res = await axios.get(`${backend_href}/api/connections`);
        setConnections(res.data);
    };

    const [cityForm, setCityForm] = useState({
        name: ""
    });

    const handleAddCity = async () => {
        setError("");
        if (!cityForm.name.trim()) {
            setError("Please provide a valid city name.");
            return;
        }

        await axios.post(`${backend_href}/api/cities`, {
            name: cityForm.name
        });

        setCityForm({name: ""});
        await loadCities();
    };

    const handleDeleteCity = async (id: string) => {
        await axios.delete(`${backend_href}/api/cities/${id}`);
        await loadCities();
        await loadConnections();
    };


    const [connectionForm, setConnectionForm] = useState({
        from: "",
        to: "",
        mode: "",
        cost: "",
        duration: "",
        distance: ""
    });

    const handleAddConnection = async () => {
        setError("");
        const {from, to, mode, cost, duration, distance} = connectionForm;

        if (!from || !to || !mode || !duration || !distance) {
            setError("Please provide all of the values.");
            return;
        }

        await axios.post(`${backend_href}/api/connections`, {
            from,
            to,
            transport: mode,
            cost: Number(cost),
            time: Number(duration),
            distance: Number(distance)
        });

        setConnectionForm({
            from: "",
            to: "",
            mode: "",
            cost: "",
            duration: "",
            distance: ""
        });

        await loadConnections();
    };

    const handleDeleteConnection = async (id: string) => {
        await axios.delete(`${backend_href}/api/connections/${id}`);
        await loadConnections();
    };

    return (
        <div className="min-h-screen bg-background">

            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage cities and connections</p>
                </div>

                <Tabs defaultValue="cities" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="cities">Cities</TabsTrigger>
                        <TabsTrigger value="connections">Connections</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cities" className="space-y-6">
                        {/* Add City Form */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                                <Plus className="h-5 w-5"/>
                                Add New City
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cityName">City Name</Label>
                                    <Input
                                        id="cityName"
                                        placeholder="Type city name..."
                                        value={cityForm.name}
                                        onChange={(e) => setCityForm({...cityForm, name: e.target.value})}
                                    />
                                </div>
                                {/*<div className="space-y-2">*/}
                                {/*    <Label htmlFor="country">Country</Label>*/}
                                {/*    <Input*/}
                                {/*        id="country"*/}
                                {/*        placeholder="USA"*/}
                                {/*        value={cityForm.country}*/}
                                {/*        onChange={(e) => setCityForm({...cityForm, country: e.target.value})}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/*<div className="space-y-2">*/}
                                {/*    <Label htmlFor="region">Region</Label>*/}
                                {/*    <Input*/}
                                {/*        id="region"*/}
                                {/*        placeholder="East Coast"*/}
                                {/*        value={cityForm.region}*/}
                                {/*        onChange={(e) => setCityForm({...cityForm, region: e.target.value})}*/}
                                {/*    />*/}
                                {/*</div>*/}
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-4">{error}</p>
                            )}

                            <Button onClick={handleAddCity} className="mt-4">
                                <Plus className="mr-2 h-4 w-4"/>
                                Add City
                            </Button>
                        </Card>

                        {/* Cities Table */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4 text-foreground">All Cities</h2>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cities.map((city) => (
                                                <TableRow key={city.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-primary"/>
                                                            {city.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {/*<Button variant="ghost" size="sm" className="mr-2">*/}
                                                        {/*    <Pencil className="h-4 w-4"/>*/}
                                                        {/*</Button>*/}
                                                        <Button variant="ghost" size="sm"
                                                                onClick={() => handleDeleteCity(city.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="connections" className="space-y-6">
                        {/* Add Connection Form */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                                <Plus className="h-5 w-5"/>
                                Add New Connection
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {/* FROM */}
                                <div className="space-y-2">
                                    <Label>From</Label>
                                    <Select
                                        value={connectionForm.from}
                                        onValueChange={(value) => setConnectionForm({...connectionForm, from: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city.id} value={city.id}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* TO */}
                                <div className="space-y-2">
                                    <Label>To</Label>
                                    <Select
                                        value={connectionForm.to}
                                        onValueChange={(value) => setConnectionForm({...connectionForm, to: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city.id} value={city.id}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* MODE */}
                                <div className="space-y-2">
                                    <Label>Transport Mode</Label>
                                    <Select
                                        value={connectionForm.mode}
                                        onValueChange={(value) => setConnectionForm({...connectionForm, mode: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select mode"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transportModes.map((mode) => (
                                                <SelectItem key={mode.value} value={mode.value}>
                                                    {mode.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* COST */}
                                <div className="space-y-2">
                                    <Label>Cost ($)</Label>
                                    <Input
                                        type="number"
                                        value={connectionForm.cost}
                                        onChange={(e) => setConnectionForm({...connectionForm, cost: e.target.value})}
                                    />
                                </div>

                                {/* TIME */}
                                <div className="space-y-2">
                                    <Label>Duration (min)</Label>
                                    <Input
                                        type="number"
                                        value={connectionForm.duration}
                                        onChange={(e) => setConnectionForm({
                                            ...connectionForm,
                                            duration: e.target.value
                                        })}
                                    />
                                </div>

                                {/* DISTANCE */}
                                <div className="space-y-2">
                                    <Label>Distance (km)</Label>
                                    <Input
                                        type="number"
                                        value={connectionForm.distance}
                                        onChange={(e) => setConnectionForm({
                                            ...connectionForm,
                                            distance: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm mt-4">{error}</p>
                            )}

                            <Button onClick={handleAddConnection} className="mt-4">
                                <Plus className="mr-2 h-4 w-4"/>
                                Add Connection
                            </Button>
                        </Card>

                        {/* Connections Table */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4 text-foreground">All Connections</h2>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Route</TableHead>
                                                <TableHead>Mode</TableHead>
                                                <TableHead>Cost</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Distance</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {connections.map((connection) => {
                                                const mode = transportModes.find(
                                                    (m) => m.value === connection.transport
                                                );
                                                const Icon = mode?.icon;

                                                return (
                                                    <TableRow key={connection.id}>
                                                        <TableCell className="font-medium">
                                                            {connection.from.name} → {connection.to.name}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {Icon && <Icon className="h-4 w-4"/>}
                                                                <span className="capitalize">
                                                {connection.transport}
                                            </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>${connection.cost}</TableCell>
                                                        <TableCell>{connection.time} min</TableCell>
                                                        <TableCell>{connection.distance} km</TableCell>

                                                        <TableCell className="text-right">
                                                            {/*<Button variant="ghost" size="sm">*/}
                                                            {/*    <Pencil className="h-4 w-4"/>*/}
                                                            {/*</Button>*/}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteConnection(connection.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};
