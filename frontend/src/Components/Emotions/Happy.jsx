import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for HTTP requests
import { getVideos } from "../../api/videos"; // Import your backend API functions

const Happy = () => {
    const [videos, setVideos] = useState([]);

    // Fetch videos from the backend and filter by dominant emotion
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch all videos from the backend
                const fetchedVideos = await getVideos();

                // Filter videos where the dominant emotion is "joy"
                const filteredVideos = await Promise.all(
                    fetchedVideos
                        .filter((video) => video.main_emotion === "joy")
                        .map(async (video, index) => {
                            const videoId = video.youtube_link.split("v=")[1]; // Extract the YouTube video ID
                            if (!videoId) return null; // Skip invalid links

                            // Fetch video details from YouTube oEmbed endpoint
                            const oEmbedResponse = await axios.get(
                                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
                            );

                            const videoDetails = oEmbedResponse.data;
                            return {
                                id: index + 1, // Assign a sequential ID
                                title: videoDetails.title, // Extract the title
                                url: video.youtube_link,
                                thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                            };
                        })
                );

                // Filter out any null values (invalid videos)
                const validVideos = filteredVideos.filter((video) => video !== null);
                setVideos(validVideos); // Update the state with valid videos
            } catch (error) {
                console.error("Error fetching videos:", error.message);
                setVideos([]); // Reset videos state in case of error
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="emotion-page">
            <h1>Happy</h1>
            <p>This page contains details about happiness.</p>

            {/* Video List */}
            <div className="video-list">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <div key={video.id} className="video-card">
                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                                <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                                <h3>{video.title}</h3>
                            </a>
                        </div>
                    ))
                ) : (
                    <p>No videos found for this emotion.</p>
                )}
            </div>

            {/* Styles */}
            <style>{`
                .emotion-page {
                    text-align: center;
                    padding: 20px;
                    background-color: #fff8e1; /* Light Yellow */
                }
                .video-list {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-top: 20px;
                }
                .video-card {
                    width: 250px;
                    background: #ffeb3b; /* Bright Yellow */
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s;
                }
                .video-card:hover {
                    transform: scale(1.05);
                }
                .video-thumbnail {
                    width: 100%;
                    border-radius: 5px;
                }
                .video-card h3 {
                    font-size: 16px;
                    margin-top: 8px;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default Happy;