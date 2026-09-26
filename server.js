const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 8000;

app.use(express.static(__dirname));

app.get("/api/shorts", async (req, res) => {
    try {
        const query = req.query.q || "gaming #shorts";

        if (!process.env.YOUTUBE_API_KEY) {
            return res.status(500).json({
                error: "YOUTUBE_API_KEY is missing from .env"
            });
        }

        const searchUrl = new URL(
            "https://www.googleapis.com/youtube/v3/search"
        );

        searchUrl.searchParams.set(
            "part",
            "snippet"
        );

        searchUrl.searchParams.set(
            "q",
            query
        );

        searchUrl.searchParams.set(
            "type",
            "video"
        );

        searchUrl.searchParams.set(
            "videoDuration",
            "short"
        );

        searchUrl.searchParams.set(
            "videoEmbeddable",
            "true"
        );

        searchUrl.searchParams.set(
            "maxResults",
            "20"
        );

        searchUrl.searchParams.set(
            "key",
            process.env.YOUTUBE_API_KEY
        );

        const searchResponse =
            await fetch(searchUrl);

        if (!searchResponse.ok) {
            const errorText =
                await searchResponse.text();

            return res.status(
                searchResponse.status
            ).json({
                error: "YouTube API request failed",
                details: errorText
            });
        }

        const searchData =
            await searchResponse.json();

        const videoIds =
            (searchData.items || [])
                .map(function(item) {
                    return item.id?.videoId;
                })
                .filter(Boolean);

        if (videoIds.length === 0) {
            return res.json([]);
        }

        const videosUrl = new URL(
            "https://www.googleapis.com/youtube/v3/videos"
        );

        videosUrl.searchParams.set(
            "part",
            "snippet,status"
        );

        videosUrl.searchParams.set(
            "id",
            videoIds.join(",")
        );

        videosUrl.searchParams.set(
            "key",
            process.env.YOUTUBE_API_KEY
        );

        const videosResponse =
            await fetch(videosUrl);

        if (!videosResponse.ok) {
            const errorText =
                await videosResponse.text();

            return res.status(
                videosResponse.status
            ).json({
                error: "YouTube video lookup failed",
                details: errorText
            });
        }

        const videosData =
            await videosResponse.json();

        const shorts =
            (videosData.items || [])
                .filter(function(video) {
                    return (
                        video.status?.privacyStatus === "public" &&
                        video.status?.embeddable === true
                    );
                })
                .map(function(video) {
                    return {
                        id: video.id,

                        title:
                            video.snippet?.title ||
                            "Untitled",

                        channel:
                            video.snippet?.channelTitle ||
                            "Unknown channel"
                    };
                });

        return res.json(shorts);

    } catch (error) {
        console.error(
            "Shorts API error:",
            error
        );

        return res.status(500).json({
            error: "Failed to load Shorts"
        });
    }
});

app.get("/", function(req, res) {
    res.sendFile(
        path.join(
            __dirname,
            "youtube.html"
        )
    );
});

app.listen(
    PORT,
    "0.0.0.0",
    function() {
        console.log(
            `YouTube clone running on port ${PORT}`
        );

        console.log(
            `Open http://localhost:${PORT}`
        );
    }
);