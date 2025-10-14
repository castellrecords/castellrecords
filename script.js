// ===================================
// CÓDIGO FINAL PARA script.js (TERMINADO Y CORREGIDO)
// Incluye: Scroll Header, Carruseles Infinitos y Lógica de Audio (Doble Animación)
// ===================================

document.addEventListener("DOMContentLoaded", () => {

    // ====== SCROLL HEADER ======
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", function () {
        if (header) { 
            // Añade o quita la clase 'scrolled' si el scroll vertical es mayor a 60px
            header.classList.toggle("scrolled", window.scrollY > 60);
        }
    });

    // ===========================================
    // FUNCIÓN CARRUSELES INFINITOS (AUTOMÁTICO) 
    // ===========================================
    function crearCarruselInfinito(carruselSelector, leftBtnSelector, rightBtnSelector) {
        const carousel = document.querySelector(carruselSelector);
        // Obtener los botones por ID (quitando el '#')
        const btnLeft = document.getElementById(leftBtnSelector.substring(1)); 
        const btnRight = document.getElementById(rightBtnSelector.substring(1)); 
        
        if (!carousel || !btnLeft || !btnRight) return;

        const scrollSpeed = 0.3; // Velocidad del movimiento automático (más bajo es más lento)
        const step = 300; // Distancia para el scroll manual
        let isPaused = false;
        let position = 0;

        // CLAVE: Duplicar contenido en el DOM para lograr el loop infinito
        const originalContent = carousel.innerHTML;
        carousel.innerHTML += originalContent; 

        // 1. Lógica de loop automático usando requestAnimationFrame
        function loop() {
            if (!isPaused) {
                position += scrollSpeed;
                
                // Si la posición excede la mitad del contenido (el contenido original), resetea instantáneamente
                if (position >= carousel.scrollWidth / 2) {
                    position = 0; 
                    carousel.scrollLeft = 0; // Salto instantáneo
                }
                carousel.scrollLeft = position;
            }
            requestAnimationFrame(loop);
        }
        loop(); // Inicia el movimiento automático

        // 2. Botones de navegación (Scroll manual)
        btnRight.addEventListener("click", () => {
            // Detener el scroll automático momentáneamente para evitar conflictos
            isPaused = true;
            setTimeout(() => isPaused = false, 500); // Reanudar después de 0.5s

            carousel.scrollBy({ left: step, behavior: "smooth" });
            // Sincronizar la posición automática después del scroll manual
            position = carousel.scrollLeft + step;
        });
        
        btnLeft.addEventListener("click", () => {
            // Detener el scroll automático momentáneamente
            isPaused = true;
            setTimeout(() => isPaused = false, 500); // Reanudar después de 0.5s

            // Manejar el salto de bucle cuando se va muy a la izquierda
            if (carousel.scrollLeft <= step) {
                 // Posicionar cerca del final de la copia para un loop suave
                 carousel.scrollLeft = carousel.scrollWidth / 2; 
            }
            carousel.scrollBy({ left: -step, behavior: "smooth" });
            // Sincronizar la posición automática
            position = carousel.scrollLeft - step; 
        });

        // 3. Pausar el scroll automático al pasar el mouse
        carousel.addEventListener("mouseenter", () => isPaused = true);
        carousel.addEventListener("mouseleave", () => isPaused = false);
    }

    // Inicialización de carruseles
    crearCarruselInfinito(".carousel:not(.artists-carousel)", "#lanzamientos-left", "#lanzamientos-right");
    crearCarruselInfinito(".artists-carousel", "#artists-left", "#artists-right");
    
    // ===========================================
    // LÓGICA DE AUDIO (PLAY/PAUSE y Animación CSS)
    // ===========================================
    const btnsPlay = document.querySelectorAll(".btn-play");
    let currentAudio = null;
    let currentBtn = null;

    // Función para detener y resetear animaciones (Quita la clase 'is-playing')
    const stopWave = (targetBtn) => {
        targetBtn.classList.remove('is-playing'); 
        targetBtn.querySelector("i.fa-solid").classList.remove("fa-pause");
        targetBtn.querySelector("i.fa-solid").classList.add("fa-play");
    };

    // Función para iniciar animaciones (Añade la clase 'is-playing')
    const startWave = (targetBtn) => {
        targetBtn.classList.add('is-playing'); 
        targetBtn.querySelector("i.fa-solid").classList.remove("fa-play");
        targetBtn.querySelector("i.fa-solid").classList.add("fa-pause");
    };

    btnsPlay.forEach((btn) => {
        const audioSrc = btn.getAttribute("data-audio");
        // Crea un nuevo objeto Audio por cada botón si aún no existe
        if (!btn.audio) btn.audio = new Audio(audioSrc); 

        btn.addEventListener("click", () => {
            
            // 1. Pausar el audio anterior si existe y es diferente
            if (currentAudio && currentAudio !== btn.audio) {
                currentAudio.pause();
                // Detener la animación del botón anterior
                if (currentBtn) {
                    stopWave(currentBtn); 
                }
            }

            currentAudio = btn.audio;
            currentBtn = btn;

            // 2. Tocar o pausar el audio actual
            if (currentAudio.paused) {
                currentAudio.play().catch(e => console.error("Error al reproducir audio:", e));
                startWave(btn); // Inicia la animación
            } else {
                currentAudio.pause();
                stopWave(btn); // Detiene la animación
            }

            // 3. Manejar fin de reproducción
            currentAudio.onended = () => {
                stopWave(btn); // Detiene la animación al finalizar
                currentAudio = null;
                currentBtn = null;
            };
        });
    });

    // ===========================================
    // LÓGICA DE VIDEOS Y FONDO BLUR
    // ===========================================
    const mainVideo = document.getElementById("video-principal");
    const miniVideos = document.querySelectorAll(".video-mini");
    const videosSection = document.querySelector(".videos");

    miniVideos.forEach((mini) => {
        const videoUrl = mini.getAttribute("data-video");
        
        // Extrae el ID del video de la URL de embed
        const videoIDMatch = videoUrl.match(/\/embed\/([^/?]+)/);
        const videoID = videoIDMatch ? videoIDMatch[1] : null; 

        if (videoID) {
            // Establece el thumbnail de YouTube (hqdefault.jpg) como fondo de cada video mini
            const thumbnailUrl = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
            mini.style.backgroundImage = `url('${thumbnailUrl}')`;
        }

        mini.addEventListener("click", () => {
            if (!videoID) return;
            
            // Carga el nuevo video con autoplay y sin videos relacionados al final (&rel=0)
            mainVideo.src = videoUrl + "?autoplay=1&rel=0";

            // Actualiza la clase 'active' para resaltado visual
            miniVideos.forEach(v => v.classList.remove('active'));
            mini.classList.add('active');

            // Actualiza el fondo blur de la sección usando la imagen de máxima resolución
            const bgUrl = `url('https://img.youtube.com/vi/${videoID}/maxresdefault.jpg')`;
            videosSection.style.setProperty('--video-bg', bgUrl);
        });
    });

    // Inicializa el video principal (selecciona el primer video al cargar)
    if (miniVideos.length > 0) {
        miniVideos[0].click(); 
    }
});