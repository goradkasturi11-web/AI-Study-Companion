const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

dns.setServers(["8.8.8.8"]);

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
});

async function startServer() {
    try {
        // =========================
        // CONNECT TO MONGODB
        // =========================
        await client.connect();

        console.log("MongoDB connected successfully!");

        const database = client.db("ai_study_companion");

        // Collections
        const users = database.collection("users");
        const notes = database.collection("notes");


        // =========================
        // REGISTER
        // =========================
        app.post("/register", async (req, res) => {
            try {
                const { name, email, password } = req.body;

                if (!name || !email || !password) {
                    return res.status(400).json({
                        message: "Name, email and password are required."
                    });
                }

                // Check if email already exists
                const existingUser = await users.findOne({
                    email: email
                });

                if (existingUser) {
                    return res.status(409).json({
                        message: "Email already registered."
                    });
                }

                // Create user
                const newUser = {
                    name: name,
                    email: email,
                    password: password,
                    createdAt: new Date()
                };

                await users.insertOne(newUser);

                res.status(201).json({
                    message: "Registration successful!"
                });

            } catch (error) {
                console.error("Registration error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // =========================
        // LOGIN
        // =========================
        app.post("/login", async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({
                        message: "Email and password are required."
                    });
                }

                // Find user
                const user = await users.findOne({
                    email: email
                });

                // User not found
                if (!user) {
                    return res.status(401).json({
                        message: "Invalid email or password."
                    });
                }

                // Check password
                if (user.password !== password) {
                    return res.status(401).json({
                        message: "Invalid email or password."
                    });
                }

                // Login successful
                res.status(200).json({
                    message: "Login successful!",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });

            } catch (error) {
                console.error("Login error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // ==================================================
        // NOTES
        // ==================================================


        // =========================
        // CREATE NOTE
        // =========================
        app.post("/notes", async (req, res) => {
            try {
                const { userId, title, content } = req.body;

                if (!userId || !title || !content) {
                    return res.status(400).json({
                        message: "User ID, title and content are required."
                    });
                }

                const newNote = {
                    userId: new ObjectId(userId),
                    title: title,
                    content: content,
                    createdAt: new Date()
                };

                const result = await notes.insertOne(newNote);

                res.status(201).json({
                    message: "Note created successfully!",
                    note: {
                        id: result.insertedId,
                        title: title,
                        content: content
                    }
                });

            } catch (error) {
                console.error("Create note error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // =========================
        // GET NOTES
        // =========================
        app.get("/notes", async (req, res) => {
            try {
                const { userId } = req.query;

                if (!userId) {
                    return res.status(400).json({
                        message: "User ID is required."
                    });
                }

                const userNotes = await notes
                    .find({
                        userId: new ObjectId(userId)
                    })
                    .sort({
                        createdAt: -1
                    })
                    .toArray();

                res.status(200).json(userNotes);

            } catch (error) {
                console.error("Get notes error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // =========================
        // UPDATE NOTE
        // =========================
        app.put("/notes/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { title, content } = req.body;

                if (!title || !content) {
                    return res.status(400).json({
                        message: "Title and content are required."
                    });
                }

                const result = await notes.updateOne(
                    {
                        _id: new ObjectId(id)
                    },
                    {
                        $set: {
                            title: title,
                            content: content,
                            updatedAt: new Date()
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        message: "Note not found."
                    });
                }

                res.status(200).json({
                    message: "Note updated successfully!"
                });

            } catch (error) {
                console.error("Update note error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // =========================
        // DELETE NOTE
        // =========================
        app.delete("/notes/:id", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await notes.deleteOne({
                    _id: new ObjectId(id)
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        message: "Note not found."
                    });
                }

                res.status(200).json({
                    message: "Note deleted successfully!"
                });

            } catch (error) {
                console.error("Delete note error:", error);

                res.status(500).json({
                    message: "Server error."
                });
            }
        });


        // =========================
        // HOME / TEST ROUTE
        // =========================
        app.get("/", (req, res) => {
            res.send("AI Study Companion Backend is running!");
        });


        // =========================
        // START SERVER
        // =========================
        const PORT = 5000;

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error
        );
    }
}

startServer();