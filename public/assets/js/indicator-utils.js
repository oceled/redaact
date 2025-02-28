/**
 * indicator-utils.js
 * Fonctions utilitaires partagées pour la gestion des indicateurs
 */

// Variable globale pour suivre si les paramètres ont été sauvegardés
window.settingsSaved = false;

// Variable globale pour stocker l'état des indicateurs avant ouverture du modal
window.previousIndicatorState = [];

/**
 * Met à jour la visibilité visuelle des indicateurs en fonction de leur état
 */
function updateIndicatorVisibility() {
    console.log('Mise à jour de la visibilité des indicateurs');
    document.querySelectorAll('.indicator-grid span').forEach(indicator => {
        if (indicator.classList.contains('active')) {
            indicator.style.opacity = '1';
        } else if (indicator.classList.contains('inactive')) {
            indicator.style.opacity = '0.5';
        }
    });
}

/**
 * Sauvegarde l'état actuel des indicateurs
 */
function saveCurrentIndicatorState() {
    console.log('Sauvegarde de l\'état actuel des indicateurs');
    
    // Vider le tableau d'état précédent
    window.previousIndicatorState = [];
    
    // Récupérer tous les indicateurs et sauvegarder leur état
    document.querySelectorAll('.indicator-grid span').forEach(indicator => {
        window.previousIndicatorState.push({
            id: indicator.id,
            classes: [...indicator.classList],
            opacity: indicator.style.opacity
        });
    });
}

/**
 * Restaure l'état précédent des indicateurs
 */
function restorePreviousIndicatorState() {
    console.log('Restauration de l\'état précédent des indicateurs');
    
    // Vérifier si l'état précédent existe
    if (!window.previousIndicatorState || window.previousIndicatorState.length === 0) {
        console.log('Aucun état précédent à restaurer');
        return;
    }
    
    // Restaurer l'état de chaque indicateur
    window.previousIndicatorState.forEach(state => {
        const indicator = document.getElementById(state.id);
        if (indicator) {
            // Réinitialiser les classes
            indicator.className = '';
            
            // Appliquer les classes sauvegardées
            state.classes.forEach(className => {
                indicator.classList.add(className);
            });
            
            // Restaurer l'opacité
            indicator.style.opacity = state.opacity;
        }
    });
}

// Exposer les fonctions globalement
window.updateIndicatorVisibility = updateIndicatorVisibility;
window.saveCurrentIndicatorState = saveCurrentIndicatorState;
window.restorePreviousIndicatorState = restorePreviousIndicatorState;