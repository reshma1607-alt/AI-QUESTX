require("dotenv").config();

const mongoose = require("mongoose");
const Image = require("./models/Image");

const images = [
    {
        imageId: "image040",
        filename: "image040.jpg",
        keywords: [
            "island",
            "ocean",
            "sea",
            "tropical",
            "tropical island",
            "beach",
            "coral reef",
            "turquoise water",
            "blue water",
            "white sand",
            "palm trees",
            "greenery",
            "coastline",
            "shore",
            "waves",
            "aerial view",
            "island resort",
            "seascape",
            "tropical beach",
            "ocean island"
        ]
    },

    {
        imageId: "image041",
        filename: "image041.jpg",
        keywords: [
            "ocean",
            "sea",
            "sunset",
            "sun",
            "horizon",
            "sky",
            "clouds",
            "pink sky",
            "purple sky",
            "orange sky",
            "sunlight",
            "reflection",
            "waves",
            "water",
            "seascape",
            "evening",
            "colorful sky",
            "sunset reflection",
            "calm ocean"
        ]
    },

    {
        imageId: "image042",
        filename: "image042.jpg",
        keywords: [
            "beach",
            "ocean",
            "sea",
            "sand",
            "shore",
            "waves",
            "blue water",
            "blue sky",
            "clouds",
            "white clouds",
            "horizon",
            "coastline",
            "seashore",
            "seascape",
            "calm ocean",
            "water",
            "shoreline",
            "beach waves",
            "sandy beach"
        ]
    },

    {
        imageId: "image043",
        filename: "image043.jpg",
        keywords: [
            "train",
            "railway",
            "mountains",
            "lake",
            "forest",
            "pine trees",
            "snowy mountains",
            "landscape",
            "railway track",
            "water",
            "reflection",
            "cliffs",
            "scenic train",
            "nature",
            "valley"
        ]
    },

    {
        imageId: "image044",
        filename: "image044.jpg",
        keywords: [
            "train",
            "railway",
            "railroad",
            "green field",
            "grass",
            "countryside",
            "landscape",
            "tracks",
            "locomotive",
            "passenger train",
            "rural",
            "sunset",
            "orange sky",
            "field",
            "scenic railway"
        ]
    },

    {
        imageId: "image045",
        filename: "image045.jpg",
        keywords: [
            "train",
            "railway",
            "locomotive",
            "waterfall",
            "mountains",
            "forest",
            "greenery",
            "bridge",
            "railway track",
            "red train",
            "scenic landscape",
            "valley",
            "nature",
            "river"
        ]
    },

    {
        imageId: "image046",
        filename: "image046.jpg",
        keywords: [
            "rain",
            "rainy day",
            "road",
            "street",
            "trees",
            "forest",
            "umbrella",
            "motorcycle",
            "wet road",
            "water",
            "rainfall",
            "greenery",
            "park",
            "people",
            "monsoon"
        ]
    },

    {
        imageId: "image047",
        filename: "image047.jpg",
        keywords: [
            "rain",
            "rainy day",
            "umbrella",
            "woman",
            "forest",
            "trees",
            "greenery",
            "flowers",
            "garden",
            "path",
            "water",
            "rainfall",
            "nature",
            "puddle",
            "landscape"
        ]
    },

    {
        imageId: "image048",
        filename: "image048.jpg",
        keywords: [
            "India Gate",
            "monument",
            "Delhi",
            "India",
            "road",
            "park",
            "trees",
            "traffic",
            "cars",
            "landmark",
            "architecture",
            "city",
            "avenue",
            "garden",
            "historical monument"
        ]
    },

    {
        imageId: "image049",
        filename: "image049.jpg",
        keywords: [
            "wooden mill",
            "watermill",
            "river",
            "stream",
            "forest",
            "trees",
            "water",
            "wooden house",
            "bridge",
            "nature",
            "greenery",
            "rocks",
            "countryside",
            "flowing water",
            "rural landscape"
        ]
    },

    {
        imageId: "image050",
        filename: "image050.jpg",
        keywords: [
            "bridge",
            "wooden bridge",
            "garden",
            "park",
            "pond",
            "stream",
            "water",
            "trees",
            "greenery",
            "willow trees",
            "rocks",
            "landscape",
            "sunlight",
            "footbridge",
            "nature"
        ]
    },

    {
        imageId: "image051",
        filename: "image051.jpg",
        keywords: [
            "bridge",
            "suspension bridge",
            "city",
            "river",
            "water",
            "New York",
            "Manhattan",
            "buildings",
            "skyline",
            "park",
            "architecture",
            "bridge cables",
            "urban landscape",
            "cityscape"
        ]
    },

    {
        imageId: "image052",
        filename: "image052.jpg",
        keywords: [
            "Golden Gate Bridge",
            "bridge",
            "suspension bridge",
            "San Francisco",
            "California",
            "ocean",
            "bay",
            "water",
            "mountains",
            "coast",
            "architecture",
            "landmark",
            "sky",
            "sunset",
            "city"
        ]
    },

    {
        imageId: "image053",
        filename: "image053.jpg",
        keywords: [
            "stone bridge",
            "arch bridge",
            "river",
            "stream",
            "forest",
            "trees",
            "rocks",
            "water",
            "greenery",
            "nature",
            "stone",
            "landscape",
            "woodland",
            "flowing water",
            "bridge"
        ]
    },

    {
        imageId: "image054",
        filename: "image054.jpg",
        keywords: [
            "lighthouse",
            "ocean",
            "sea",
            "sunset",
            "sun",
            "sky",
            "pink sky",
            "purple sky",
            "orange sky",
            "coast",
            "rocks",
            "shore",
            "seascape",
            "beacon",
            "coastline"
        ]
    },

    {
        imageId: "image055",
        filename: "image055.jpg",
        keywords: [
            "lighthouse",
            "ocean",
            "sea",
            "night",
            "dark sky",
            "waves",
            "rocks",
            "coast",
            "shore",
            "beacon",
            "tower",
            "seascape",
            "water",
            "lighthouse tower",
            "nightscape"
        ]
    },

    {
        imageId: "image056",
        filename: "image056.jpg",
        keywords: [
            "lighthouse",
            "ocean",
            "sea",
            "sunset",
            "sun",
            "light beam",
            "beacon",
            "coast",
            "rocks",
            "sky",
            "orange sky",
            "water",
            "seascape",
            "lighthouse tower",
            "coastline"
        ]
    },

    {
        imageId: "image057",
        filename: "image057.jpg",
        keywords: [
            "beach",
            "ocean",
            "sea",
            "island",
            "mountains",
            "cliffs",
            "tropical",
            "tropical beach",
            "blue water",
            "turquoise water",
            "sand",
            "boat",
            "longtail boat",
            "trees",
            "coastline",
            "rock formations",
            "landscape",
            "seascape"
        ]
    },

    {
        imageId: "image058",
        filename: "image058.jpg",
        keywords: [
            "robot",
            "human",
            "artificial intelligence",
            "AI",
            "technology",
            "computer",
            "gaming",
            "video game",
            "digital screen",
            "futuristic",
            "cyber",
            "neon",
            "control panel",
            "computer screen",
            "robot assistant",
            "digital technology",
            "human robot interaction"
        ]
    },

    {
        imageId: "image059",
        filename: "image059.jpg",
        keywords: [
            "lake",
            "water",
            "pebbles",
            "stones",
            "rocks",
            "beach",
            "shore",
            "mountains",
            "blue sky",
            "clouds",
            "landscape",
            "clear water",
            "river",
            "lake shore",
            "nature",
            "green trees",
            "colorful stones",
            "pebble beach",
            "scenic landscape"
        ]
    },

    {
        imageId: "image060",
        filename: "image060.jpg",
        keywords: [
            "road",
            "mountain",
            "mountain road",
            "highway",
            "winding road",
            "curved road",
            "roadway",
            "car",
            "vehicle",
            "landscape",
            "hills",
            "rocks",
            "mountainside",
            "valley",
            "nature",
            "asphalt road",
            "scenic road",
            "hairpin turn",
            "driving"
        ]
    },

    {
        imageId: "image061",
        filename: "image061.jpg",
        keywords: [
            "sunset",
            "sunrise",
            "palm trees",
            "tropical",
            "tropical landscape",
            "ocean",
            "water",
            "lake",
            "sky",
            "pink sky",
            "purple sky",
            "clouds",
            "reflection",
            "silhouette",
            "shore",
            "coast",
            "sun",
            "evening",
            "tropical sunset"
        ]
    }
];


async function seedImages() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB Connected");

        for (const image of images) {

            await Image.findOneAndUpdate(
                {
                    imageId: image.imageId
                },
                {
                    $set: {
                        filename: image.filename,
                        keywords: image.keywords
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            console.log(
                `Saved: ${image.imageId}`
            );
        }

        console.log(
            "All images and keywords saved successfully."
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "Seed images error:",
            error
        );

        process.exit(1);
    }
}


seedImages();