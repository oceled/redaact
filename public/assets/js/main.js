// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Vérifier d'abord si indicator_selection a terminé son initialisation
        if (window.indicators) {
            console.log('Indicateurs trouvés, initialisation du gestionnaire...');
            // Attendre un peu que indicator_selection termine
            setTimeout(() => {
                window.indicatorManager = new IndicatorManager(window.indicators);
            }, 500);
        } else {
            console.warn('Aucun indicateur trouvé dans window.indicators');
        }
        
        // ... autre code ...
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
});

// Gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erreur sur dashboard:', error);
    return false;
};