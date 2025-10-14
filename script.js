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
    // ESTA LÓGICA ES CORRECTA Y ROBUSTA CONTRA ERRORES
    // ===========================================
    const btnsPlay = document.querySelectorAll(".btn-play");
    // Único reproductor global para manejar el estado
    let globalAudioPlayer = new Audio(); 
    let currentActiveBtn = null; // Botón actualmente activo (para animaciones)

    // Función para detener y resetear animaciones y el botón
    const stopWave = (targetBtn) => {
        if (targetBtn) {
            // Detener la animación
            targetBtn.querySelector('.music-bars').classList.remove('playing');
            
            // Cambia el icono a PLAY
            const icon = targetBtn.querySelector("i.fa-solid");
            if (icon) {
                icon.classList.remove("fa-pause");
                icon.classList.add("fa-play");
            }
        }
    };

    // Función para iniciar animaciones y el botón
    const startWave = (targetBtn) => {
        if (targetBtn) {
            // Iniciar la animación
            targetBtn.querySelector('.music-bars').classList.add('playing');
            
            // Cambia el icono a PAUSE
            const icon = targetBtn.querySelector("i.fa-solid");
            if (icon) {
                icon.classList.remove("fa-play");
                icon.classList.add("fa-pause");
            }
        }
    };
    
    // Manejar fin de reproducción (Se usa el evento 'ended' del reproductor)
    globalAudioPlayer.addEventListener('ended', () => {
        // Detiene la animación al finalizar
        stopWave(currentActiveBtn); 
        currentActiveBtn = null;
    });

    btnsPlay.forEach((btn) => {
        const audioSrc = btn.getAttribute("data-audio");

        btn.addEventListener("click", () => {
            
            // 1. Si el botón clickeado es el mismo que está activo (PAUSAR / RESUMIR)
            if (currentActiveBtn === btn) {
                
                if (globalAudioPlayer.paused) {
                    // RESUMIR
                    globalAudioPlayer.play().then(() => {
                        startWave(btn);
                    }).catch(e => {
                        console.error("Error al reanudar audio:", e);
                        alert("No se pudo reanudar el audio. Revisa la Consola.");
                    });
                } else {
                    // PAUSAR
                    globalAudioPlayer.pause();
                    stopWave(btn);
                }
                return; // Salir de la función después de manejar pausa/resumen
            }

            // 2. Si es un botón diferente (CAMBIAR AUDIO)
            
            // Pausar y resetear el audio y botón anterior (si existe)
            if (currentActiveBtn) {
                globalAudioPlayer.pause();
                stopWave(currentActiveBtn);
            }
            
            // Asignar nueva fuente
            globalAudioPlayer.src = audioSrc;
            currentActiveBtn = btn;
            
            // Intentar reproducir y manejar error (CLAVE: El uso de la Promesa .play().then().catch())
            globalAudioPlayer.play().then(() => {
                // Reproducción exitosa
                startWave(btn);
            }).catch(e => {
                // Falla de Autoplay o ruta (NotSupportedError)
                console.error("Error de reproducción de audio:", e);
                alert("No se pudo reproducir el audio. La causa es probablemente el bloqueo de reproducción automática del navegador. Revisa la Consola.");
                
                // Si falla, limpiar el estado
                stopWave(btn); 
                currentActiveBtn = null;
                globalAudioPlayer.pause(); 
                globalAudioPlayer.src = ''; // Limpiar la fuente
            });
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
        const videoID = videoIDMatch ? videoID[1] : null; 

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