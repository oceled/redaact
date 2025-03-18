// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Vérifier si window.indicators existe (chargé depuis le template Twig)
        console.log('Démarrage de l\'application...');
        
        if (window.indicators) {
            console.log('Indicateurs trouvés, initialisation du gestionnaire...');
            window.indicatorManager = new IndicatorManager(window.indicators);
        } else {
            console.warn('Aucun indicateur trouvé dans window.indicators');
        }

        // Initialiser le gestionnaire de formulaire si le formulaire existe
        if (document.getElementById('indicatorForm')) {
            console.log('Formulaire trouvé, initialisation du gestionnaire de formulaire...');
            window.formHandler = new FormHandler();
        } else {
            console.warn('Formulaire non trouvé dans le DOM');
        }

        // Correction pour le menu burger mobile
        fixMobileMenu();

        // Correction pour les hauteurs des cards services
        equalizeServiceCardHeights();

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
});

// Fonction pour corriger le menu mobile
function fixMobileMenu() {
    console.log("Initialisation du menu mobile...");
    
    // Sélectionner les éléments nécessaires
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarGlobal = document.getElementById('navbar_global');
    
    if (!navbarToggler || !navbarGlobal) {
        console.warn("Éléments du menu non trouvés");
        return;
    }
    
    // Déterminer la couleur de fond du menu pour adapter le bouton de fermeture
    const navbarBgColor = getComputedStyle(document.querySelector('.navbar') || document.body).backgroundColor;
    const bgPrimary = document.querySelector('.bg-primary');
    const bgColor = bgPrimary ? getComputedStyle(bgPrimary).backgroundColor : '#f8f9fa'; // Couleur par défaut
    
    // Créer et ajouter le bouton de fermeture si nécessaire
    let closeButton = document.querySelector('.collapse-close i, .collapse-close .fa-times, .close-button');
    
    if (!closeButton) {
        console.log("Bouton de fermeture non trouvé, création en cours...");
        
        // Trouver ou créer le conteneur .collapse-close
        let collapseClose = document.querySelector('.collapse-close');
        if (!collapseClose) {
            // Chercher l'en-tête du menu
            const header = document.querySelector('.navbar-collapse-header');
            if (header) {
                const row = header.querySelector('.row');
                if (row) {
                    collapseClose = document.createElement('div');
                    collapseClose.className = 'col-6 collapse-close';
                    row.appendChild(collapseClose);
                }
            }
            
            // Si on n'a pas trouvé d'en-tête, on en crée un
            if (!collapseClose) {
                console.log("Création d'un en-tête complet pour le menu mobile");
                const header = document.createElement('div');
                header.className = 'navbar-collapse-header';
                
                const row = document.createElement('div');
                row.className = 'row';
                
                const brand = document.createElement('div');
                brand.className = 'col-6 collapse-brand';
                
                const brandLink = document.createElement('a');
                brandLink.className = 'navbar-brand shadow-soft py-2 px-3 rounded border border-light';
                brandLink.href = '/';
                
                const brandName = document.createElement('span');
                brandName.className = 'h4';
                brandName.id = 'brandname';
                brandName.textContent = 'REDA\'ACT';
                
                brandLink.appendChild(brandName);
                brand.appendChild(brandLink);
                
                collapseClose = document.createElement('div');
                collapseClose.className = 'col-6 collapse-close';
                
                row.appendChild(brand);
                row.appendChild(collapseClose);
                header.appendChild(row);
                
                // Insérer au début du menu
                if (navbarGlobal.firstChild) {
                    navbarGlobal.insertBefore(header, navbarGlobal.firstChild);
                } else {
                    navbarGlobal.appendChild(header);
                }
            }
        }
        
        // Maintenant que nous avons le conteneur, créons le bouton de fermeture
        if (collapseClose) {
            closeButton = document.createElement('a');
            closeButton.href = '#';
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;'; // Symbole X
            closeButton.style.fontSize = '24px';
            closeButton.style.textDecoration = 'none';
            closeButton.style.color = '#333';
            closeButton.style.display = 'block';
            closeButton.style.float = 'right';
            closeButton.style.padding = '5px 10px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.backgroundColor = bgColor;
            closeButton.style.borderRadius = '4px';
            closeButton.style.margin = '5px';
            closeButton.style.border = '1px solid #e4e4e4';
            
            collapseClose.appendChild(closeButton);
            console.log("Bouton de fermeture créé avec succès, couleur de fond:", bgColor);
        }
    } else {
        // Mettre à jour le style du bouton existant pour correspondre au thème
        closeButton.style.backgroundColor = bgColor;
        closeButton.style.borderRadius = '4px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.margin = '5px';
        closeButton.style.border = '1px solid #e4e4e4';
        console.log("Bouton de fermeture trouvé et style mis à jour");
    }
    
    // Gérer l'événement clic sur le bouton burger
    navbarToggler.addEventListener('click', function(e) {
        console.log("Clic sur le bouton burger");
        navbarGlobal.classList.toggle('show');
    });
    
    // Gérer l'événement clic sur le bouton de fermeture
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Clic sur le bouton de fermeture");
            navbarGlobal.classList.remove('show');
        });
    }
    
    // Fermer le menu au clic sur les liens
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            console.log("Clic sur un lien du menu");
            navbarGlobal.classList.remove('show');
        });
    });
    
    // S'assurer que le menu est correctement stylisé sur mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 991.98px) {
            .navbar-collapse.show {
                display: block !important;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1030;
                background-color: ${bgColor};
                overflow-y: auto;
                padding: 20px;
            }
            
            .navbar-collapse-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log("Menu mobile initialisé avec succès");
}

// Fonction pour égaliser les hauteurs des cards services
function equalizeServiceCardHeights() {
    const serviceItems = document.querySelectorAll('.service-item');
    if (serviceItems && serviceItems.length > 0) {
        let maxHeight = 0;
        
        // Trouver la hauteur maximale
        serviceItems.forEach(function(item) {
            if (item.clientHeight > maxHeight) {
                maxHeight = item.clientHeight;
            }
        });
        
        // Appliquer la hauteur maximale à tous les éléments
        serviceItems.forEach(function(item) {
            item.style.minHeight = maxHeight + "px";
        });
        
        console.log('Hauteurs des cards services égalisées');
    }
}

// Gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erreur sur dashboard:', error);
    return false;
};

// Fonction pour gérer l'affichage du bouton back-to-top
function initBackToTopButton() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (!backToTopBtn) {
        console.warn("Bouton back-to-top non trouvé");
        return;
    }
    
    // Masquer le bouton initialement
    backToTopBtn.style.display = 'none';
    backToTopBtn.style.position = 'fixed';
    backToTopBtn.style.right = '20px';
    backToTopBtn.style.bottom = '70px';
    backToTopBtn.style.zIndex = '99';
    
    // Fonction pour vérifier la position de défilement
    function checkScrollPosition() {
        // Trouver la deuxième section
        // Utilisons un sélecteur qui trouvera la deuxième section (section ou div majeure après le hero)
        const sections = document.querySelectorAll('section, main > div.section');
        let secondSectionTop = 0;
        
        if (sections.length >= 2) {
            // Utiliser le haut de la deuxième section comme point de déclenchement
            secondSectionTop = sections[1].offsetTop;
        } else {
            // Fallback: utiliser une valeur fixe (ex: 500px) si on ne trouve pas de sections
            secondSectionTop = 500;
        }
        
        // Vérifier si l'utilisateur a défilé au-delà de la première section
        if (window.scrollY >= secondSectionTop - 100) { // -100 pour afficher un peu avant
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }
    
    // Vérifier la position au chargement
    checkScrollPosition();
    
    // Ajouter un écouteur d'événement pour le défilement
    window.addEventListener('scroll', checkScrollPosition);
    
    console.log("Initialisation du bouton back-to-top terminée");
}

// Ajouter cette fonction au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Autres initialisations...
    
    // Initialiser le bouton back-to-top
    initBackToTopButton();
});

// Ajouter des styles CSS dynamiquement pour le bouton back-to-top
(function() {
    const backToTopStyle = document.createElement('style');
    backToTopStyle.textContent = `
        .back-to-top {
            transition: display 0.3s ease, opacity 0.3s ease;
            opacity: 0.7;
        }
        
        .back-to-top:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(backToTopStyle);
})();