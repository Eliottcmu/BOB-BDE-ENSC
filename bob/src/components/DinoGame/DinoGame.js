import React, { useState, useEffect, useRef } from "react";
import { postScore, getLeaderboard, getUserHighestScore } from '../../services/api';

const DinoGame = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [personalBest, setPersonalBest] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const canvasRef = useRef(null);
    const gameInterval = useRef(null);

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
        try {
            const data = await getLeaderboard(10);
            setLeaderboard(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    // Fetch personal best score
    const fetchPersonalBest = async () => {
        const userId = localStorage.getItem('userId'); // Assuming you store userId in localStorage
        if (userId) {
            try {
                const data = await getUserHighestScore(userId);
                setPersonalBest(data.Points);
            } catch (error) {
                console.error('Error fetching personal best:', error);
            }
        }
    };

    // Save score when game ends
    const saveScore = async (finalScore) => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                await postScore({
                    UserId: userId,
                    Points: finalScore
                });
                await fetchLeaderboard();
                await fetchPersonalBest();
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        fetchPersonalBest();
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === "Space") setIsVisible(true);
            if (e.key === "Escape") setIsVisible(false);
            if (e.key === "Tab") {
                e.preventDefault();
                setShowLeaderboard(prev => !prev);
            }
        };
        const handleTouchStart = () => {
            setIsVisible(true);
        };

        window.addEventListener("keydown", handleKeyPress);
        window.addEventListener("touchstart", handleTouchStart);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
            window.removeEventListener("touchstart", handleTouchStart);
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            const dino = { x: 50, y: 120, width: 30, height: 30, isJumping: false, jumpHeight: 0 };
            const obstacles = [];
            let gameSpeed = 7;
            let isRunning = true;
            let distance = 0;

            const jump = () => {
                if (!dino.isJumping) {
                    dino.isJumping = true;
                    let jumpUp = true;
                    const jumpInterval = setInterval(() => {
                        if (jumpUp) {
                            dino.jumpHeight += 8;
                            if (dino.jumpHeight >= 70) jumpUp = false;
                        } else {
                            dino.jumpHeight -= 8;
                            if (dino.jumpHeight <= 0) {
                                dino.isJumping = false;
                                dino.jumpHeight = 0;
                                clearInterval(jumpInterval);
                            }
                        }
                    }, 30);
                }
            };

            const createObstacle = () => {
                obstacles.push({ x: canvas.width, y: 120, width: 20, height: 30 });
            };

            const updateGame = () => {
                if (!isRunning) return;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "#535353";
                context.fillRect(dino.x, dino.y - dino.jumpHeight, dino.width, dino.height);
                context.fillStyle = "#FF5733";
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    const obstacle = obstacles[i];
                    obstacle.x -= gameSpeed;
                    if (obstacle.x + obstacle.width < 0) {
                        obstacles.splice(i, 1);
                    }
                    if (
                        dino.x < obstacle.x + obstacle.width &&
                        dino.x + dino.width > obstacle.x &&
                        dino.y - dino.jumpHeight < obstacle.y + obstacle.height &&
                        dino.y + dino.height - dino.jumpHeight > obstacle.y
                    ) {
                        isRunning = false;
                        const finalScore = Math.floor(distance);
                        saveScore(finalScore);
                        alert(`Game Over! Score: ${finalScore}. Press Space or tap to restart.`);
                        setIsVisible(false);
                    }
                    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                distance += 0.3;
                setScore(Math.floor(distance));
                if (gameSpeed < 12) {
                    gameSpeed = 5 + Math.min(7, distance / 100);
                }
            };

            gameInterval.current = setInterval(() => {
                createObstacle();
            }, 2000);

            const gameLoop = setInterval(() => {
                updateGame();
            }, 2);

            const handleKeyPress = (e) => {
                if (e.code === "Space") jump();
            };
            const handleTouchStart = () => jump();

            window.addEventListener("keydown", handleKeyPress);
            window.addEventListener("touchstart", handleTouchStart);

            return () => {
                clearInterval(gameInterval.current);
                clearInterval(gameLoop);
                window.removeEventListener("keydown", handleKeyPress);
                window.removeEventListener("touchstart", handleTouchStart);
            };
        }
    }, [isVisible]);

    return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-100 ${isVisible ? 'flex' : 'hidden'}`}>
            <div className="p-4 text-center">
                <h2 className="text-xl mb-2">Jeu du Golmon qui saute</h2>
                <p className="text-sm text-gray-600">Appuyez sur espace pour sauter</p>
                <p className="text-sm text-gray-600">Appuyez sur ESC pour quitter</p>
                <p className="text-sm text-gray-600">Appuyez sur TAB pour voir le classement</p>
                <p className="text-lg font-bold mt-4">Score: {score} puntos</p>
                <p className="text-md text-gray-600">Meilleur score personnel: {personalBest} puntos</p>
            </div>

            <canvas ref={canvasRef} className="border border-gray-400 w-full max-w-md h-[150px]" width={600} height={150} />

            {showLeaderboard && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-bold mb-2">Classement</h3>
                    <div className="space-y-2">
                        {leaderboard.map((entry, index) => (
                            <div key={entry.UserId} className="flex justify-between items-center">
                                <span className="font-medium">
                                    {index + 1}. {entry.UserName}
                                </span>
                                <span className="text-gray-600">
                                    {entry.HighestScore} puntos
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DinoGame;