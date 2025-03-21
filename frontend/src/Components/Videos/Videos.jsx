import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlayCircle, FaPause } from 'react-icons/fa';
import "./Videos.css"
import {getVideos, createVideo, updateVideo, deleteVideo} from "../../api/videos"
import { useLocation } from 'react-router-dom';
const VideoAnalysisTester = ({ theme }) => {
    const location = useLocation(); // Access the location object
    const youtubeLink = location.state?.youtubeLink; // Extract the YouTube link from state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [videos, setVideos] = useState([]);
    const [progress, setProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [emotionData, setEmotionData] = useState({
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
    });
    useEffect(() => {
        if (youtubeLink) {
            console.log("Received YouTube link:", youtubeLink);
            // You can now use the `youtubeLink` for analysis or storage
        }
    }, [youtubeLink]);
    useEffect(() => {
        const fetchStoredVideos = async () => {
            try {
                const fetchedVideos = await getVideos();
                setVideos(fetchedVideos);
            } catch (error) {
                console.error("Error fetching videos:", error.message);
            }
        };
    
        fetchStoredVideos();
    }, []);

    // Function to check if the video already exists in the database
    const checkIfVideoExists = async (link) => {
        const existingVideo = videos.find(video => video.youtube_link === link);
        return existingVideo;
    };

    // Mock API call - replace this with our real API call later
    const generateMockAnalysis = () => {
        // Simulate some randomized but realistic-looking data
        return {
            joy: Math.floor(Math.random() * 5) + 3, // 3-8 range for positive emotions
            sadness: Math.floor(Math.random() * 4) + 1, // 1-5 range for negative emotions
            anger: Math.floor(Math.random() * 3) + 1, // 1-4 range
            fear: Math.floor(Math.random() * 4) + 1, // 1-5 range
        };
    };

    // This function will be replaced with your actual API call
    const analyzeSentiment = async () => {
        try {
            // In the future, replace this with:
            // const response = await fetch('/your-api-endpoint');
            // const data = await response.json();
            const mockData = generateMockAnalysis();
            return mockData;
        } catch (error) {
            console.error('Analysis failed:', error);
            return null;
        }
    };

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        setProgress(0);
        setAnalysisComplete(false);
        
        // Get the analysis results
        const results = await analyzeSentiment();

        // Make it so that it looks better 
        
        if (results) {
            // Animate progress bar
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        setIsAnalyzing(false);
                        setAnalysisComplete(true);
                        setEmotionData(results); // Set the results when progress completes
                        return 100;
                    }
                    return prev + 2;
                });
            }, 20);
        } else {
            setIsAnalyzing(false);
            // Handle error case
            alert('Analysis failed. Please try again.');
        }
    };

    const StoreVideo = async (videoLink, emotionData) => {
        const dominant = Object.entries(emotionData).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        console.log(dominant);
        try {
            const newVideo = await createVideo({
                youtube_link: videoLink,
                emotion_data: emotionData, // Include emotion data in the request
                main_emotion: dominant
            });
            console.log("Video stored successfully:", newVideo);
            
            return newVideo;
        } catch (error) {
            console.error("Error storing video:", error.message);
            alert("Failed to store video. Please try again.");
        }
    };

    const getEmotionColor = (emotion) => {
        const colors = {
            joy: '#FFD700',
            sadness: '#4169E1',
            anger: '#FF4500',
            fear: '#800080',
        };
        return colors[emotion] || '#666';
    };

    const handleStartAnalysis = useCallback(async () => {
        let existingVideo = await checkIfVideoExists(youtubeLink);
        if (existingVideo) {
            // Video exists in the database, use stored emotion data
            console.log("Video already exists in the database:", existingVideo);
            const emotionResults = existingVideo.emotion_data
            console.log(emotionResults)
            setEmotionData(emotionResults);
            setAnalysisComplete(true);
            setHasStarted(true);
            setProgress(100)
            alert("Video already analyzed. Displaying stored results.");
        } else {
            // Video does not exist, perform analysis
            console.log("Video not found in the database. Starting analysis...");
            setHasStarted(true);
            setIsAnalyzing(true);
            setProgress(0);
            setAnalysisComplete(false);
            const emotionResults = generateMockAnalysis()
            // Simulate analysis progress
            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        clearInterval(interval);
                        setIsAnalyzing(false);
                        setAnalysisComplete(true);
                        setEmotionData(emotionResults);
                        console.log(emotionResults)
                        return 100;
                    }
                    return prevProgress + 50;
                });
            }, 500);
            StoreVideo(youtubeLink, emotionResults);
        }
        existingVideo = await checkIfVideoExists(youtubeLink);
    }, [youtubeLink, videos]);

    const getDominantEmotion = () => {
        return Object.entries(emotionData).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    };

    

    // Make the entire  div of anaylsis results disapaer
    const renderEmotionBars = () => {
        return Object.entries(emotionData).map(([emotion, value]) => (
            <div key={emotion} className="emotion-stat-row">
                <span className="emotion-label">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
                <div className="stat-bar-container">
                    <div 
                        className="stat-bar-fill"
                        style={{ 
                            width: `${(value / 8) * 100}%`,
                            backgroundColor: getEmotionColor(emotion)
                        }}
                    />
                    <div className="stat-markers">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="stat-marker" />
                        ))}
                    </div>
                </div>
                <span className="stat-value">{value}/8</span>
            </div>
        ));
    };

    return (
        <div className={`video-analysis ${theme}`}>
            <div className="analysis-container">
                <h2>Video Emotion Analysis</h2>
                
                {/* Progress Section */}
                <div className="progress-section">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {isAnalyzing && (
                        <div className="analyzing-text">
                            Analyzing video... {progress}%
                        </div>
                    )}
                </div>
                
                {/* Analysis Results */}
                {hasStarted && ( 
                    <div className={`analysis-results ${analysisComplete ? 'visible' : ''}`}>
                        <div className="sentiment-box">
                            <h3>Primary Emotion</h3>
                            <div className="dominant-emotion" style={{ 
                                backgroundColor: getEmotionColor(getDominantEmotion())
                            }}>
                                {getDominantEmotion().toUpperCase()}
                            </div>
                        </div>
    
                        <div className="emotion-stats">
                            <h3>Emotion Breakdown</h3>
                            {renderEmotionBars()}
                        </div>
                    </div>
                )}
    
                {/* Start Analysis Button */}
                <button 
                    className="control-button"
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? <FaPause /> : <FaPlayCircle />}
                    {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                </button>
    
                {/* Display Stored Videos */}
                <h3>Stored Videos</h3>
                <ul>
                    {videos.map((video) => (
                        <li key={video._id}>
                            <a href={video.youtube_link} target="_blank" rel="noopener noreferrer">
                                {video.youtube_link}
                            </a>
                            <p>Emotion Data: {JSON.stringify(video.emotion_data)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default VideoAnalysisTester;