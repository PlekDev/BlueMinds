// Lista de minijuegos existentes en el proyecto
const existingGames = [
    {
        id: 'emotion-game',
        title: 'Reconoce Emociones',
        description: 'Aprende a identificar diferentes emociones',
        icon: 'fa-smile',
        path: 'games/emotion-game/index.html'
    },
    {
        id: 'memory-game',
        title: 'Juego de Memoria',
        description: 'Repite la secuencia de colores',
        icon: 'fa-brain',
        path: 'games/memory-game/index.html'
    },
    {
        id: 'patterns-game',
        title: 'Juego de Patrones',
        description: 'Completa los patrones secuenciales',
        icon: 'fa-shapes',
        path: 'games/patterns-game/index.html'
    }
];

// Función para obtener la lista de juegos
function getGamesList() {
    return existingGames;
}

// Función para obtener un juego específico por ID
function getGameById(id) {
    return existingGames.find(game => game.id === id);
}

// Función para renderizar la lista de juegos en un contenedor
function renderGamesList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let gamesHTML = '<div class="games-grid">';
    
    existingGames.forEach(game => {
        gamesHTML += `
            <div class="game-card">
                <div class="game-thumbnail">
                    <i class="fas ${game.icon}"></i>
                </div>
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-description">${game.description}</p>
                    <a href="${game.path}" class="game-button">Jugar</a>
                </div>
            </div>
        `;
    });
    
    gamesHTML += '</div>';
    container.innerHTML = gamesHTML;
}