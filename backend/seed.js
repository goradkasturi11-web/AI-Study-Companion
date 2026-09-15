const dns = require("dns");
const { MongoClient } = require("mongodb");
require("dotenv").config();

dns.setServers(["8.8.8.8"]);

const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
});

async function seedDatabase() {
    try {
        await client.connect();

        console.log("MongoDB connected successfully!");

        const db = client.db("ai_study_companion");

        // Create/get collections
        const users = db.collection("users");
        const notes = db.collection("notes");
        const quizzes = db.collection("quizzes");
        const studyPlans = db.collection("study_plans");
        const progress = db.collection("progress");

        // Create collections if they don't already exist
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(col => col.name);

        const collections = [
            "users",
            "notes",
            "quizzes",
            "study_plans",
            "progress"
        ];

        for (const collectionName of collections) {
            if (!existingNames.includes(collectionName)) {
                await db.createCollection(collectionName);
                console.log(`Created collection: ${collectionName}`);
            }
        }

        console.log("Database structure is ready.");

        // Add sample note only if notes collection is empty
        const noteCount = await notes.countDocuments();

        if (noteCount === 0) {
            await notes.insertOne({
                title: "Sample Note",
                subject: "Science",
                content: "Photosynthesis is the process by which green plants make food using sunlight, water and carbon dioxide.",
                createdAt: new Date()
            });

            console.log("Sample note inserted.");
        }

        // Add sample quiz only if quizzes collection is empty
        const quizCount = await quizzes.countDocuments();

        if (quizCount === 0) {
            await quizzes.insertOne({
                title: "Basic Science Quiz",
                subject: "Science",
                questions: [
                    {
                        question: "What do plants use to make food?",
                        options: [
                            "Sunlight",
                            "Plastic",
                            "Iron",
                            "Sand"
                        ],
                        answer: "Sunlight"
                    }
                ]
            });

            console.log("Sample quiz inserted.");
        }
        // Add sample study plan if collection is empty
const studyPlanCount = await studyPlans.countDocuments();

if (studyPlanCount === 0) {
    await studyPlans.insertOne({
        title: "Weekly Study Plan",
        userEmail: "demo@student.com",
        subjects: [
            {
                subject: "Mathematics",
                topic: "Algebra",
                duration: 60,
                completed: false
            },
            {
                subject: "Science",
                topic: "Photosynthesis",
                duration: 45,
                completed: false
            },
            {
                subject: "English",
                topic: "Grammar",
                duration: 45,
                completed: false
            }
        ],
        createdAt: new Date()
    });

    console.log("Sample study plan inserted.");
} else {
    console.log("Study plans already contain data. Skipping.");
}


// Add sample progress if collection is empty
const progressCount = await progress.countDocuments();

if (progressCount === 0) {
    await progress.insertOne({
        userEmail: "demo@student.com",
        quizzesCompleted: 2,
        quizzesAttempted: 3,
        averageScore: 78,
        notesCreated: 3,
        studyHours: 4,
        subjects: {
            Mathematics: 80,
            Science: 75,
            English: 79
        },
        lastUpdated: new Date()
    });

    console.log("Sample progress inserted.");
} else {
    console.log("Progress already contains data. Skipping.");
}
        console.log("Seed completed successfully!");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

seedDatabase();