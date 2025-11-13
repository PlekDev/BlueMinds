// Lista de minijuegos existentes en el proyecto
const existingGames = [
    // Juegos existentes
    {
        id: 'emotion-game',
        title: 'Reconoce Emociones',
        description: 'Aprende a identificar diferentes emociones',
        icon: 'fa-smile',
        path: '../games/emotion-game/index.html', // RUTA CORREGIDA
        category: 'conducta'
    },
    {
        id: 'memory-game',
        title: 'Juego de Memoria',
        description: 'Repite la secuencia de colores',
        icon: 'fa-brain',
        path: '../games/memory-game/index.html', // RUTA CORREGIDA
        category: 'lenguaje'
    },
    {
        id: 'patterns-game',
        title: 'Juego de Patrones',
        description: 'Completa los patrones secuenciales',
        icon: 'fa-shapes',
        path: '../games/patterns-game/index.html', // RUTA CORREGIDA
        category: 'lenguaje'
    },
    
    // Nuevos juegos de Lenguaje
    {
        id: 'asocia-imagen',
        title: 'Asocia la Imagen Correcta',
        description: 'Selecciona la palabra correcta para cada imagen',
        icon: 'fa-image',
        path: '../games/visual-games/asocia-imagen/index.html', // RUTA CORREGIDA
        category: 'lenguaje'
    },
    {
        id: 'eco-palabras',
        title: 'El Eco de las Palabras',
        description: 'Repite las palabras que escuchas',
        icon: 'fa-volume-up',
        path: '../games/auditivo/eco-palabras/index.html', // RUTA CORREGIDA
        category: 'lenguaje'
    },
    {
        id: 'oracion-colores',
        title: 'Arma la Oración con Colores',
        description: 'Ordena las palabras para formar oraciones',
        icon: 'fa-font',
        path: '../games/lecto-escritor/oracion-colores/index.html', // RUTA CORREGIDA
        category: 'lenguaje'
    },
    
    // Nuevos juegos de Conducta
    {
        id: 'sigue-lider',
        title: 'Sigue al Líder de Movimiento',
        description: 'Imita los movimientos del avatar',
        icon: 'fa-running',
        path: '../games/kinestesico/sigue-lider/index.html', // RUTA CORREGIDA
        category: 'conducta'
    },
    
    // Nuevos juegos de Ocupacional
    {
        id: 'explora-profesiones',
        title: 'Explora Profesiones',
        description: 'Aprende sobre diferentes trabajos',
        icon: 'fa-briefcase',
        path: '../games/ocupacional/explora-profesiones/index.html', // RUTA CORREGIDA
        category: 'ocupacional'
    }
];

// Función para obtener la lista de juegos
function getGamesList() {
    return existingGames;
}

// Función para obtener juegos por categoría
function getGamesByCategory(category) {
    return existingGames.filter(game => game.category === category);
}

// Función para obtener un juego específico por ID
function getGameById(id) {
    return existingGames.find(game => game.id === id);
}

// Función para renderizar la lista de juegos en un contenedor
function renderGamesList(containerId, category = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const games = category ? getGamesByCategory(category) : existingGames;
    
    let gamesHTML = '';
    
    games.forEach(game => {
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
    
    container.innerHTML = gamesHTML;
}

// Función para mostrar juegos por categoría
function showCategoryGames(category) {
    // Ocultar todas las secciones
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'none';
    
    // Obtener los juegos de la categoría
    const games = getGamesByCategory(category);
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Construir el HTML de la sección
    const sectionHTML = `
        <div class="category-games-screen" id="categoryGamesScreen">
            <header>
                <div class="container">
                    <div class="header-content">
                        <div class="logo">
                            <i class="fas fa-graduation-cap"></i>
                            <span>BlueMinds</span>
                        </div>
                        <div class="user-info">
                            <span id="userName">Hola, Usuario!</span>
                            <div class="user-avatar">U</div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main>
                <div class="container">
                    <section class="category-header">
                        <div class="back-button">
                            <button onclick="backToMain()">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                        <div class="category-info">
                            <div class="category-icon">
                                <i class="fas ${getCategoryIcon(category)}"></i>
                            </div>
                            <h1 class="category-title">${categoryTitle}</h1>
                            <p class="category-description">${getCategoryDescription(category)}</p>
                        </div>
                    </section>
                    
                    <section class="games-section">
                        <h2 class="section-title">Juegos de ${categoryTitle}</h2>
                        <div class="games-grid" id="category-games-container">
                            <!-- Los juegos se cargarán dinámicamente -->
                        </div>
                    </section>
                </div>
            </main>
            
            <footer>
                <div class="container">
                    <div class="footer-content">
                        <p>&copy; BlueMinds - Neuro Play World</p>
                        <div class="footer-links">
                            <a href="../index.html">Inicio</a>
                            <a href="#">Acerca de</a>
                            <a href="#">Para Padres</a>
                            <a href="#">Ayuda</a>
                            <a href="#">Términos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;
    
    // Insertar la sección en el body
    document.body.insertAdjacentHTML('beforeend', sectionHTML);
    
    // Cargar los juegos en el contenedor
    renderGamesList('category-games-container', category);
    
    // Aplicar animaciones
    setTimeout(() => {
        animateCategoryGames();
    }, 100);
}

// Función para obtener el icono de una categoría
function getCategoryIcon(category) {
    const icons = {
        'lenguaje': 'fa-language',
        'conducta': 'fa-smile',
        'ocupacional': 'fa-briefcase'
    };
    return icons[category] || 'fa-gamepad';
}

// Función para obtener la descripción de una categoría
function getCategoryDescription(category) {
    const descriptions = {
        'lenguaje': 'Aprende nuevas palabras y mejora tu comunicación',
        'conducta': 'Desarrolla habilidades sociales y emocionales',
        'ocupacional': 'Explora diferentes profesiones y actividades'
    };
    return descriptions[category] || 'Juegos educativos para niños';
}

// Función para volver a la página principal
function backToMain() {
    const categoryScreen = document.getElementById('categoryGamesScreen');
    if (categoryScreen) {
        categoryScreen.remove();
    }
    document.getElementById('mainScreen').style.display = 'block';
}

// Función para animar la sección de juegos por categoría
function animateCategoryGames() {
    const gameCards = document.querySelectorAll('#category-games-container .game-card');
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}