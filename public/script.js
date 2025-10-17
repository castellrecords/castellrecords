// ===========================================
// *** INICIO: CÓDIGO DE INICIALIZACIÓN DE FIREBASE (ACTUALIZADO CON TUS CREDENCIALES) ***
// Estos imports son necesarios para iniciar la app y obtener las instancias
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


// 🚨🚨🚨 TUS CREDENCIALES REALES DE FIREBASE (COPIADAS DE TU CONSOLA) 🚨🚨🚨
// NOTA DE SEGURIDAD: Estas credenciales son públicas. ¡Asegúrate de que tus REGLAS DE FIRESTORE estén configuradas correctamente!
const firebaseConfig = {
    apiKey: "AIzaSyAjzd2uzf1PbGTapfAN3JStX4D2ku4BfUw",
    authDomain: "castell-records.firebaseapp.com",
    projectId: "castell-records",
    storageBucket: "castell-records.firebasestorage.app",
    messagingSenderId: "809195265233",
    appId: "1:809195265233:web:116fec83c4063b6fcbf9f0",
    measurementId: "G-7NCHX70ZXK"
};

// Inicializa Firebase y obtiene las referencias
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 
// ===========================================
// *** FIN: CÓDIGO DE INICIALIZACIÓN DE FIREBASE ***
// ===========================================


document.addEventListener("DOMContentLoaded", () => {
    
    // ====== SCROLL HEADER ======
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", function () {
        if (header) { 
            // Añade o quita la clase 'scrolled' si el scroll vertical es mayor a 60px
            header.classList.toggle("scrolled", window.scrollY > 60);
        }
    });

    // --- NUEVAS REFERENCIAS PARA MENÚ MÓVIL (HAMBURGUESA) ---
    const navMenu = document.querySelector(".nav-menu");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelectorAll(".nav-menu a, #auth-btn"); // Incluye enlaces y el botón de Login/Publicar

    // ===========================================
    // LÓGICA DE MENÚ MÓVIL (HAMBURGUESA)
    // ===========================================
    
    // Referencias a Elementos del DOM del CMS (se definen aquí para ser globales en DOMContentLoaded)
    const loginSection = document.getElementById('login-section');
    const cmsSection = document.getElementById('cms-section');
    
    // 1. Alternar menú al hacer clic en el botón de hamburguesa
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            
            // Cerrar el menú de CMS/Login si está abierto al abrir el menú principal
            if (loginSection) loginSection.style.display = 'none';
            if (cmsSection) cmsSection.style.display = 'none';
        });
    }

    // 2. Cerrar menú al hacer clic en un enlace o en el botón de Auth dentro del menú
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });


    // ===========================================
    // FUNCIÓN CARRUSELES INFINITOS (AUTOMÁTICO) 
    // ===========================================
    // *** CORRECCIÓN DE LIMPIEZA DE CÓDIGO: Ahora acepta IDs puros sin el '#' ***
    function crearCarruselInfinito(carruselSelector, leftBtnId, rightBtnId) {
        const carousel = document.querySelector(carruselSelector);
        
        // Obtener los botones por ID (usando el ID directo)
        const btnLeft = document.getElementById(leftBtnId); 
        const btnRight = document.getElementById(rightBtnId); 
        
        if (!carousel || !btnLeft || !btnRight) return;

        const scrollSpeed = 0.3; // Velocidad del movimiento automático (más bajo es más lento)
        const step = 300; // Distancia para el scroll manual
        let isPaused = false;
        let position = 0; // Inicializamos position a 0

        // CLAVE: Duplicar contenido en el DOM para lograr el loop infinito
        const originalContent = carousel.innerHTML;
        carousel.innerHTML += originalContent; 
        
        // 1. Manejo del Scroll y Loop Reset (CORRECCIÓN CLAVE)
        // Este listener se ejecuta en cualquier scroll (automático, manual por botón, o drag del usuario)
        carousel.addEventListener('scroll', () => {
            // Sincroniza la variable 'position' con el scroll real del DOM
            position = carousel.scrollLeft; 

            // Si el scroll llega al final del contenido original (inicio de la COPIA)
            if (position >= carousel.scrollWidth / 2) {
                // Saltamos instantáneamente al inicio de la copia (haciendo el bucle invisible)
                carousel.scrollLeft = position - (carousel.scrollWidth / 2);
            } 
            // Si el scroll llega cerca del inicio (al usar el botón izquierdo)
            else if (position <= 0) {
                    // Saltamos instantáneamente al final del contenido original (inicio de la COPIA)
                carousel.scrollLeft = position + (carousel.scrollWidth / 2);
            }
        });
        
        // 2. Lógica de loop automático usando requestAnimationFrame
        function loop() {
            if (!isPaused) {
                // Mueve la posición automáticamente
                position += scrollSpeed;
                // El scrollListener manejará el reset (salto) cuando position > scrollWidth / 2
                carousel.scrollLeft = position;
            }
            requestAnimationFrame(loop);
        }
        loop(); // Inicia el movimiento automático

        // 3. Botones de navegación (Scroll manual)
        btnRight.addEventListener("click", () => {
            // Detener el scroll automático momentáneamente para evitar conflictos
            isPaused = true;
            setTimeout(() => isPaused = false, 500); // Reanudar después de 0.5s

            // El scrollListener actualizará 'position' y manejará el loop si es necesario
            carousel.scrollBy({ left: step, behavior: "smooth" });
        });
        
        btnLeft.addEventListener("click", () => {
            // Detener el scroll automático momentáneamente
            isPaused = true;
            setTimeout(() => isPaused = false, 500); // Reanudar después de 0.5s

            // El scrollListener actualizará 'position' y manejará el loop si es necesario
            carousel.scrollBy({ left: -step, behavior: "smooth" });
        });

        // 4. Pausar el scroll automático al pasar el mouse
        carousel.addEventListener("mouseenter", () => isPaused = true);
        carousel.addEventListener("mouseleave", () => isPaused = false);
    }

    // Inicialización de carruseles
    // *** CORRECCIÓN: Se pasan los IDs de los botones sin el '#' ***
    crearCarruselInfinito(".carousel:not(.artists-carousel)", "lanzamientos-left", "lanzamientos-right");
    crearCarruselInfinito(".artists-carousel", "artists-left", "artists-right");
    
    // ===========================================
    // LÓGICA DE AUDIO (PLAY/PAUSE y Animación CSS)
    // ===========================================
    const btnsPlay = document.querySelectorAll(".btn-play");
    // Único reproductor global para manejar el estado
    let globalAudioPlayer = new Audio(); 
    let currentActiveBtn = null; // Botón actualmente activo (para animaciones)

    // Función para detener y resetear animaciones y el botón
    const stopWave = (targetBtn) => {
        if (targetBtn) {
            // Detener la animación
            const musicBars = targetBtn.querySelector('.music-bars');
            if(musicBars) musicBars.classList.remove('playing');
            
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
            const musicBars = targetBtn.querySelector('.music-bars');
            if(musicBars) musicBars.classList.add('playing');
            
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
            
            // Intentar reproducir y manejar error (MUY IMPORTANTE)
            globalAudioPlayer.play().then(() => {
                // Reproducción exitosa
                startWave(btn);
            }).catch(e => {
                // Falla de Autoplay o ruta (NotSupportedError)
                console.error("Error de reproducción de audio:", e);
                alert("No se pudo reproducir el audio. Puede que tu navegador esté bloqueando la reproducción automática o la ruta del archivo esté errónea. Revisa la Consola.");
                
                // Si falla, limpiar el estado para evitar el AbortError en clics futuros
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
    
    
    // ==========================================================
    // *** CÓDIGO AÑADIDO PARA FIREBASE (CMS y AUTH) ***
    // ==========================================================

    // --- 1. Referencias a Elementos del DOM del CMS ---
    const authBtn = document.getElementById('auth-btn');
    // const loginSection = document.getElementById('login-section'); // Ya definido arriba
    // const cmsSection = document.getElementById('cms-section'); // Ya definido arriba
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const cmsLogoutBtn = document.getElementById('cms-logout-btn');
    const newsForm = document.getElementById('news-form');
    const newsTitle = document.getElementById('news-title');
    const newsContent = document.getElementById('news-content');
    const cmsMessage = document.getElementById('cms-message');

    // ** APUNTAR AL CONTENEDOR DE NOTICIAS DINÁMICAS **
    const dynamicNewsContainer = document.getElementById('dynamic-news-container');
    const loadingMessage = document.getElementById('loading-message');


    // --- 2. Función para renderizar noticias desde Firestore ---
    const renderNews = async () => {
        // Si no existe el contenedor dinámico (ej. estamos en index.html), salimos.
        if (!dynamicNewsContainer) return;

        // Muestra el mensaje de carga
        if(loadingMessage) loadingMessage.style.display = 'block';
        dynamicNewsContainer.innerHTML = ''; 

        try {
            const noticiasCollection = collection(db, "noticias");
            // Consulta para obtener las noticias, ordenadas por timestamp de forma descendente (más recientes primero)
            const q = query(noticiasCollection, orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            
            // Oculta el mensaje de carga
            if(loadingMessage) loadingMessage.style.display = 'none';

            if (snapshot.empty) {
                dynamicNewsContainer.innerHTML = '<p class="no-news-message">Aún no hay noticias publicadas.</p>';
                return;
            }

            let htmlContent = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                // Formatea la fecha
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) : 'Fecha desconocida';

                // Usamos una expresión regular simple para detectar saltos de línea y reemplazarlos con <br>
                const formattedContent = data.content.replace(/\n/g, '<br>');

                htmlContent += `
                    <article class="news-card">
                        <h3>${data.title}</h3>
                        <p class="news-date">Publicado el: ${date}</p>
                        <p>${formattedContent}</p>
                    </article>
                `;
            });

            dynamicNewsContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error("Error al cargar las noticias:", error);
            dynamicNewsContainer.innerHTML = '<p class="error-message" style="color: red;">Error al cargar las noticias. Revisa la Consola.</p>';
        }
    };


    // --- 3. Manejo de Autenticación (Cambio de estado de usuario) ---
    // Esta función se ejecuta CADA VEZ que el estado de login cambia (al entrar, salir, o cargar la página)
    onAuthStateChanged(auth, (user) => {
        // Referencia para el feed público de index.html (si existe)
        const noticiasFeed = document.getElementById('noticias-feed');
        
        if (user) {
            // Usuario logeado (Secretaria)
            if(authBtn) authBtn.textContent = 'Publicar Noticia';
            if(loginSection) loginSection.style.display = 'none';
            if(cmsSection) cmsSection.style.display = 'block';
            
            // Ocultar el feed de noticias duplicado en Index (si existe)
            if(noticiasFeed) noticiasFeed.style.display = 'none';

        } else {
            // Usuario no logeado (Público)
            if(authBtn) authBtn.textContent = 'Login / Publicar';
            if(loginSection) loginSection.style.display = 'none';
            if(cmsSection) cmsSection.style.display = 'none';
            
            // Mostrar el feed de noticias para el público en Index (si existe)
            if(noticiasFeed) noticiasFeed.style.display = 'block';
        }
    });

    // --- 4. Eventos del Botón Principal (auth-btn) ---
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            const noticiasFeed = document.getElementById('noticias-feed');
            
            // Asegurarse de cerrar el menú de navegación principal al abrir el CMS/Login
            if (navMenu) navMenu.classList.remove('active');

            if (auth.currentUser) {
                // Si está logeado: El botón muestra/oculta el CMS
                if(cmsSection) cmsSection.style.display = (cmsSection.style.display === 'none' || cmsSection.style.display === '') ? 'block' : 'none';
                if(loginSection) loginSection.style.display = 'none';
                
                // Asegúrate de que, al abrir el CMS, el feed de noticias se oculte para que no haya doble contenido.
                if(noticiasFeed) noticiasFeed.style.display = 'none';

            } else {
                // Si NO está logeado: El botón muestra/oculta el formulario de Login
                if(loginSection) loginSection.style.display = (loginSection.style.display === 'none' || loginSection.style.display === '') ? 'block' : 'none';
                if(cmsSection) cmsSection.style.display = 'none';
            }
        });
    }


    // --- 5. Manejo del Login ---
    if (loginForm && loginEmail && loginPassword && loginError) { // Asegurando que todos los elementos existan
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginEmail.value;
            const password = loginPassword.value;

            loginError.textContent = '';
            loginError.style.display = 'none';

            try {
                // Intenta iniciar sesión con email y contraseña
                await signInWithEmailAndPassword(auth, email, password);
                
                // Si tiene éxito, onAuthStateChanged manejará la visibilidad de la UI.
                loginEmail.value = '';
                loginPassword.value = '';

            } catch (error) {
                console.error("Error de autenticación:", error.code, error.message);
                
                let errorMessage = "Error desconocido al iniciar sesión.";

                switch(error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        errorMessage = "Credenciales inválidas. Verifica el email y la contraseña.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "Formato de email incorrecto.";
                        break;
                    default:
                        errorMessage = "Error: " + error.message;
                        break;
                }

                loginError.textContent = errorMessage;
                loginError.style.display = 'block';
            }
        });
    }

    // --- 6. Manejo del Logout ---
    if (cmsLogoutBtn) {
        cmsLogoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                // onAuthStateChanged se encargará de resetear la UI.
                
                // Vuelve a cargar las noticias después de cerrar sesión (para asegurar que el feed se actualice)
                renderNews();
                
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                alert("Error al cerrar sesión. Revisa la Consola.");
            }
        });
    }


    // --- 7. Manejo del Formulario CMS (Publicar Noticia) ---
    if (newsForm && newsTitle && newsContent && cmsMessage) { // Asegurando que todos los elementos existan
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = newsTitle.value;
            const content = newsContent.value;

            cmsMessage.textContent = 'Publicando...';
            cmsMessage.style.color = 'orange';
            cmsMessage.style.display = 'block';

            // Validación simple
            if (title.trim() === '' || content.trim() === '') {
                    cmsMessage.textContent = '❌ Por favor, completa el título y el contenido.';
                    cmsMessage.style.color = 'red';
                    setTimeout(() => cmsMessage.style.display = 'none', 3000);
                    return;
            }

            try {
                // Guarda el documento en la colección 'noticias'
                await addDoc(collection(db, "noticias"), {
                    title: title,
                    content: content,
                    author: auth.currentUser.email, // Guarda quién publicó la noticia
                    timestamp: serverTimestamp()     // Añade la marca de tiempo de Firebase (para ordenar)
                });
                
                // Mensaje de éxito
                cmsMessage.textContent = '✅ Noticia publicada con éxito!';
                cmsMessage.style.color = 'green';
                
                // Limpiar formulario
                newsTitle.value = '';
                newsContent.value = '';

                // Volver a cargar el feed de noticias después de la publicación
                renderNews();
                
                // Ocultar mensaje después de un tiempo
                setTimeout(() => {
                    cmsMessage.style.display = 'none';
                }, 3000);

            } catch (error) {
                console.error("Error al publicar la noticia:", error);
                cmsMessage.textContent = '❌ Error al publicar la noticia. Revisa la Consola.';
                cmsMessage.style.color = 'red';
            }
        });
    }


    // --- 8. Llamada inicial para cargar las noticias ---
    // Esta es la primera acción de Firebase: Cargar y mostrar las noticias existentes.
    // La función renderNews ahora solo se ejecutará si encuentra el #dynamic-news-container (es decir, en noticias.html)
    renderNews();


    // ==========================================================
    // *** FIN: CÓDIGO PARA FIREBASE (CMS y AUTH) ***
    // ==========================================================
});