import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import neo4j from "neo4j-driver";
import {v4 as uuid} from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Neo4j driver setup
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
        process.env.NEO4J_USERNAME,
        process.env.NEO4J_PASSWORD
    )
);

// Utility for sessions
function getSession() {
    return driver.session({database: process.env.NEO4J_DATABASE});
}

function parsePath(p) {
    const nodes = [];
    const connections = [];

    if (p.start) nodes.push(p.start.properties);

    for (const segment of p.segments) {

        connections.push({
            ...segment.relationship.properties,
            from: segment.start.properties.id,
            to: segment.end.properties.id
        });

        if (!nodes.find(n => n.id === segment.end.properties.id)) {
            nodes.push(segment.end.properties);
        }
    }

    return {nodes, connections};
}

// GET all cities
app.get("/api/cities", async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run("MATCH (c:City) RETURN c ORDER BY c.name");
        const cities = result.records.map(r => r.get("c").properties);
        res.json(cities);
    } finally {
        await session.close();
    }
});

// GET city by ID
app.get("/api/cities/:id", async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run(
            "MATCH (c:City {id: $id}) RETURN c",
            {id: req.params.id}
        );
        if (result.records.length === 0)
            return res.status(404).json({error: "City not found"});
        res.json(result.records[0].get("c").properties);
    } finally {
        await session.close();
    }
});

// POST create city
app.post("/api/cities", async (req, res) => {
    const session = getSession();
    const id = uuid();
    const {name} = req.body;
    try {
        await session.run(
            "CREATE (c:City {id:$id, name:$name}) RETURN c",
            {id, name}
        );
        res.json({id, name});
    } finally {
        await session.close();
    }
});

// PUT update city
app.put("/api/cities/:id", async (req, res) => {
    const session = getSession();
    const {name} = req.body;

    try {
        const result = await session.run(
            "MATCH (c:City {id:$id}) SET c.name = $name RETURN c",
            {id: req.params.id, name}
        );
        if (result.records.length === 0)
            return res.status(404).json({error: "City not found"});

        res.json(result.records[0].get("c").properties);
    } finally {
        await session.close();
    }
});

// DELETE city
app.delete("/api/cities/:id", async (req, res) => {
    const session = getSession();
    try {
        await session.run(
            "MATCH (c:City {id:$id}) DETACH DELETE c",
            {id: req.params.id}
        );
        res.json({success: true});
    } finally {
        await session.close();
    }
});

app.get("/api/connections", async (req, res) => {
    const session = getSession();

    // Helper to convert Neo4j integers to JS numbers
    const toNumber = (value) => (value && typeof value === "object" && "low" in value ? value.low : value);

    try {
        const result = await session.run(`
            MATCH (a:City)-[r:CONNECTED]->(b:City)
            RETURN a, r, b
        `);

        const connections = result.records.map((r) => {
            const from = r.get("a").properties;
            const to = r.get("b").properties;
            const rel = r.get("r").properties;

            return {
                id: rel.id,
                from,
                to,
                transport: rel.transport,
                cost: toNumber(rel.cost),
                distance: toNumber(rel.distance),
                time: toNumber(rel.time),
            };
        });

        res.json(connections);
    } finally {
        await session.close();
    }
});


// POST create connection
app.post("/api/connections", async (req, res) => {
    const session = getSession();
    const id = uuid();
    const {from, to, transport, distance, time, cost} = req.body;

    try {
        const query = `
      MATCH (a:City {id:$from}), (b:City {id:$to})
      CREATE (a)-[r:CONNECTED {
        id:$id, transport:$transport, distance:$distance, time:$time, cost:$cost
      }]->(b)
      RETURN a, r, b
    `;

        const result = await session.run(query, {
            id: id,
            from: from,
            to: to,
            transport: transport,
            distance: neo4j.int(distance),
            time: neo4j.int(time),
            cost: neo4j.int(cost)
        });

        res.json({success: true, id});
    } finally {
        await session.close();
    }
});

// DELETE connection
app.delete("/api/connections/:id", async (req, res) => {
    const session = getSession();
    try {
        await session.run(
            "MATCH ()-[r:CONNECTED {id:$id}]-() DELETE r",
            {id: req.params.id}
        );
        res.json({success: true});
    } finally {
        await session.close();
    }
});

app.get("/api/routes", async (req, res) => {
    const session = getSession();

    const {
        from,
        to,
        transport,
        sort = "time",
        limit = 10,
        maxCost,
        maxDistance,
        maxTime
    } = req.query;

    const allowedTransports = transport ? transport.split(",") : [];

    const cypher = `
        WITH $allowedTransports AS allowed
        MATCH (start:City {id:$from}), (end:City {id:$to})
        MATCH p = (start)-[r:CONNECTED*]->(end)

        WHERE (
            size(allowed) = 0 OR ALL(rel IN r WHERE rel.transport IN allowed)
        )

        WITH p,
            relationships(p) AS rels,
            REDUCE(d=0, x IN relationships(p) | d + x.distance) AS totalDistance,
            REDUCE(t=0, x IN relationships(p) | t + x.time) AS totalTime,
            REDUCE(c=0, x IN relationships(p) | c + x.cost) AS totalCost

        WHERE 
            ($maxDistance IS NULL OR totalDistance <= $maxDistance) AND
            ($maxTime IS NULL OR totalTime <= $maxTime) AND
            ($maxCost IS NULL OR totalCost <= $maxCost)

        RETURN p, totalDistance, totalTime, totalCost

        ORDER BY 
          CASE $sort 
            WHEN "cost" THEN totalCost
            WHEN "distance" THEN totalDistance
            ELSE totalTime
          END ASC

        LIMIT $limit
    `;

    try {
        const result = await session.run(cypher, {
            from,
            to,
            allowedTransports,
            sort,
            limit: neo4j.int(limit),
            maxCost: maxCost ? neo4j.int(maxCost) : null,
            maxDistance: maxDistance ? neo4j.int(maxDistance) : null,
            maxTime: maxTime ? neo4j.int(maxTime) : null,
        });

        const paths = result.records.map(record => {
            const p = record.get("p");
            const parsed = parsePath(p);

            return {
                nodes: parsed.nodes,
                connections: parsed.connections,
                total: {
                    distance: record.get("totalDistance").toNumber(),
                    time: record.get("totalTime").toNumber(),
                    cost: record.get("totalCost").toNumber()
                }
            };
        });

        res.json(paths);

    } finally {
        await session.close();
    }
});


// Search for connections A -> ??
app.get("/api/explore", async (req, res) => {
    const {
        from,
        transport,
        maxDistance,
        maxCost,
        maxTime,
        maxLayovers = 10,
        limit = 20
    } = req.query;

    if (!from) {
        return res.status(400).json({error: "from is required"});
    }

    const allowedTransports = transport ? transport.split(",") : [];

    try {
        const session = driver.session();

        const cypher = `
        MATCH p = (start:City {id: $start})-[r:CONNECTED*1..10]->(dest:City)
    
        WHERE ALL(rel IN r WHERE
          ($transport IS NULL OR rel.transport IN $transport) AND
          ($maxDistance IS NULL OR rel.distance <= $maxDistance) AND
          ($maxCost IS NULL OR rel.cost <= $maxCost)
        )
    
        WITH p, dest,
          REDUCE(d = 0, rel IN r | d + rel.distance) AS totalDistance,
          REDUCE(c = 0, rel IN r | c + rel.cost) AS totalCost,
          REDUCE(t = 0, rel IN r | t + rel.time) AS totalTime
    
        WHERE ($maxTime IS NULL OR totalTime <= $maxTime)
    
        RETURN p, dest, totalDistance, totalCost, totalTime
        ORDER BY totalCost ASC
        LIMIT $limit;
        `;


        const result = await session.run(cypher, {
            start: from,
            transport: allowedTransports.length ? allowedTransports : null,
            maxDistance: maxDistance ? neo4j.int(maxDistance) : null,
            maxCost: maxCost ? neo4j.int(maxCost) : null,
            maxTime: maxTime ? neo4j.int(maxTime) : null,
            maxLayovers: neo4j.int(maxLayovers),
            limit: neo4j.int(limit)
        });

        const output = result.records.map(record => {
            const p = record.get("p");
            const parsed = parsePath(p);

            return {
                destination: record.get("dest").properties,
                path: parsed,
                total: {
                    distance: record.get("totalDistance")?.toNumber?.() ?? 0,
                    cost: record.get("totalCost")?.toNumber?.() ?? 0,
                    time: record.get("totalTime")?.toNumber?.() ?? 0
                }
            };
        });

        res.json(output);
    } catch (err) {
        console.error("Error in /explore", err);
        res.status(500).json({error: "Internal error"});
    }
});


const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serve frontend static files
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all for React Router
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});
