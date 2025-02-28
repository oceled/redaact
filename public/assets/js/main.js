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

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
});

// Gestion des erreurs globales
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erreur sur dashboard:', error);
    return false;
};