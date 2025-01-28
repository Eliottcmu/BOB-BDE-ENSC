import React, { useState, useEffect, useRef } from "react";

const DinoGame = () => {
    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef(null);
    const gameInterval = useRef(null);
    const [score, setScore] = useState(0);

    // Styles pour le conteneur du jeu
    const containerStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(247, 247, 247, 0.97)",
        zIndex: 9999,
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === "Space") setIsVisible(true); // Lancer le jeu avec Space
            if (e.key === "Escape") setIsVisible(false); // Quitter le jeu avec Escape
        };

        const handleTouchStart = () => {
            setIsVisible(true); // Lancer le jeu avec un toucher
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

            // Variables du jeu
            const dino = { x: 50, y: 120, width: 30, height: 30, isJumping: false, jumpHeight: 0 };
            const obstacles = [];
            let gameSpeed = 7; // Démarre à 7
            let isRunning = true;
            let distance = 0;

            // Gestion du saut
            const jump = () => {
                if (!dino.isJumping) {
                    dino.isJumping = true;
                    let jumpUp = true;
                    const jumpInterval = setInterval(() => {
                        if (jumpUp) {
                            dino.jumpHeight += 6;
                            if (dino.jumpHeight >= 70) jumpUp = false;
                        } else {
                            dino.jumpHeight -= 5;
                            if (dino.jumpHeight <= 0) {
                                dino.isJumping = false;
                                dino.jumpHeight = 0;
                                clearInterval(jumpInterval);
                            }
                        }
                    }, 30);
                }
            };

            // Création d'un nouvel obstacle
            const createObstacle = () => {
                obstacles.push({ x: canvas.width, y: 120, width: 20, height: 30 });
            };

            // Mise à jour du jeu
            const updateGame = () => {
                if (!isRunning) return;

                // Effacer le canvas
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Dessiner le dinosaure
                context.fillStyle = "#535353";
                context.fillRect(dino.x, dino.y - dino.jumpHeight, dino.width, dino.height);

                // Déplacer et dessiner les obstacles
                context.fillStyle = "#FF5733";
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    const obstacle = obstacles[i];
                    obstacle.x -= gameSpeed;

                    // Supprimer les obstacles hors de l'écran
                    if (obstacle.x + obstacle.width < 0) {
                        obstacles.splice(i, 1);
                    }

                    // Collision avec le dinosaure
                    if (
                        dino.x < obstacle.x + obstacle.width &&
                        dino.x + dino.width > obstacle.x &&
                        dino.y - dino.jumpHeight < obstacle.y + obstacle.height &&
                        dino.y + dino.height - dino.jumpHeight > obstacle.y
                    ) {
                        isRunning = false; // Fin du jeu
                        alert(`Game Over! Score: ${Math.floor(distance)}. Press Space or tap to restart.`);
                        setIsVisible(false);
                    }

                    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                // Mettre à jour la distance (score)
                distance += 0.3;
                setScore(Math.floor(distance));

                if (gameSpeed < 12) {
                    gameSpeed = 5 + Math.min(7, distance / 100); // Augmentation de la rapidité jusqu'à 12 de speed
                }
            };



            // Ajouter des obstacles à intervalles réguliers
            gameInterval.current = setInterval(() => {
                createObstacle();
            }, 2000);

            // Boucle de jeu
            const gameLoop = setInterval(() => {
                updateGame();
            }, 3);

            // Ajouter un gestionnaire pour les sauts
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
        <div style={containerStyle}>
            <div className="p-4 text-center">
                <h2 className="text-xl mb-2">Jeu du Golmon qui saute</h2>
                <p className="text-sm text-gray-600">Appuyer sur espace pour sauter</p>
                <p className="text-sm text-gray-600">Appuyer ESC pour se barrer</p>
                <p className="text-lg font-bold mt-4">Score: {score} puntos</p>
            </div>
            <canvas ref={canvasRef} width={600} height={150} style={{ border: "1px solid #ccc" }}></canvas>
        </div>
    );
};

export default DinoGame;
