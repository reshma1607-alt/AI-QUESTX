const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const Image = require("./models/Image");

dotenv.config();


// ==========================================
// DATABASE CONNECTION
// ==========================================

async function importImages() {

    try {

        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");


        // ==========================================
        // LOAD CORRECT IMAGE DATA
        // ==========================================

        const imageDataPath = path.join(
            __dirname,
            "..",
            "image-data",
            "images.json"
        );


        if (!fs.existsSync(imageDataPath)) {

            throw new Error(
                `images.json not found at: ${imageDataPath}`
            );

        }


        const images =
            JSON.parse(
                fs.readFileSync(
                    imageDataPath,
                    "utf8"
                )
            );


        console.log(
            `Found ${images.length} image records`
        );


        // ==========================================
        // VALIDATE IMAGE DATA
        // ==========================================

        for (const image of images) {

            if (!image.imageId) {
                throw new Error(
                    "Image is missing imageId"
                );
            }

            if (!image.filename) {
                throw new Error(
                    `${image.imageId} is missing filename`
                );
            }

            if (
                !Array.isArray(image.keywords) ||
                image.keywords.length < 30
            ) {

                throw new Error(
                    `${image.imageId} has only ${
                        Array.isArray(image.keywords)
                            ? image.keywords.length
                            : 0
                    } keywords. Minimum required: 30`
                );

            }

        }


        // ==========================================
        // IMPORT / UPDATE
        // ==========================================

        for (const image of images) {

            await Image.findOneAndUpdate(

                {
                    imageId: image.imageId
                },

                image,

                {
                    upsert: true,
                    returnDocument: "after"
                }

            );


            console.log(
                `Imported: ${image.imageId} → ${image.filename} | Keywords: ${image.keywords.length}`
            );

        }


        console.log(
            "================================"
        );

        console.log(
            "Image import completed successfully"
        );

        console.log(
            `Total imported: ${images.length}`
        );

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "Image import failed:"
        );

        console.error(
            error.message
        );

    } finally {

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed"
        );

    }

}


importImages();