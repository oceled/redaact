/**
 * Correction complète pour la gestion des indicateurs 27, 28 et 29
 * Ce fichier remplace indicator_fix.js
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif pour les indicateurs...');
    
    // Fonction pour déterminer si la sous-traitance est activée
    function isSubcontractingEnabled() {
        console.log('Vérification du statut de sous-traitance...');
        
        // 1. Vérifier directement dans le DOM pour le texte "Oui"
        const subTraitanceElements = document.querySelectorAll('.modal-body .mb-3');
        for (const element of subTraitanceElements) {
            if (element.textContent.includes('Recours à la sous-traitance')) {
                const pAnswer = element.querySelector('p.p_answer');
                if (pAnswer && pAnswer.textContent.trim().includes('Oui')) {
                    console.log('Sous-traitance = OUI détectée depuis le texte affiché');
                    return true;
                }
            }
        }
        
        // 2. Vérifier directement dans la page pour le texte "Recours à la sous-traitance: Oui"
        const pageContent = document.body.textContent || '';
        if (pageContent.includes('Recours à la sous-traitance') && 
            pageContent.indexOf('Oui', pageContent.indexOf('Recours à la sous-traitance')) > 0) {
            console.log('Sous-traitance = OUI détectée par analyse du texte de la page');
            return true;
        }
        
        // 3. Vérifier dans window.userSettings
        if (window.userSettings) {
            if (window.userSettings.sousTraitance === 1 || 
                window.userSettings.sousTraitance === '1' ||
                window.userSettings.sousTraitance === true ||
                (typeof window.userSettings.sousTraitance === 'string' && 
                window.userSettings.sousTraitance.toLowerCase() === 'oui')) {
                console.log('Sous-traitance = OUI détectée depuis userSettings');
                return true;
            }
        }
        
        console.log('Aucune sous-traitance détectée');
        return false;
    }

    // Fonction pour déterminer si l'action est de type AFC
    function isAFCSelected() {
        if (!window.orgaInfo || !window.orgaInfo.org_cat_act) {
            // Essayer de récupérer depuis l'élément DOM
            const dashboardElement = document.getElementById('dashboard-container');
            if (dashboardElement && dashboardElement.dataset.orgaInfo) {
                try {
                    const orgaInfo = JSON.parse(dashboardElement.dataset.orgaInfo);
                    if (orgaInfo && orgaInfo.org_cat_act) {
                        let types = [];
                        try {
                            types = JSON.parse(orgaInfo.org_cat_act);
                        } catch (e) {
                            types = [orgaInfo.org_cat_act];
                        }
                        
                        return types.some(type => 
                            String(type).trim().toUpperCase() === 'AFC' || 
                            String(type).trim().toUpperCase().includes('AFC')
                        );
                    }
                } catch (e) {
                    console.error('Erreur lors de la vérification AFC:', e);
                }
            }
            return false;
        }
        
        const types = Array.isArray(window.orgaInfo.org_cat_act) ? 
                     window.orgaInfo.org_cat_act : 
                     [window.orgaInfo.org_cat_act];
        
        return types.some(type => {
            const typeStr = String(type).trim().toUpperCase();
            return typeStr === 'AFC' || typeStr.includes('AFC');
        });
    }

    // Fonction pour appliquer les règles spécifiques aux indicateurs 27, 28, 29
    function applySpecificIndicatorRules() {
        console.log('Application des règles spécifiques aux indicateurs 27, 28, 29...');
        
        // Récupérer les indicateurs concernés
        const indicator27 = document.getElementById('ind_27');
        const indicator28 = document.getElementById('ind_28');
        const indicator29 = document.getElementById('ind_29');
        
        // Règle pour l'indicateur 27 (sous-traitance)
        if (indicator27) {
            const usesSubcontracting = isSubcontractingEnabled();
            if (usesSubcontracting) {
                console.log('CORRECTION: Activation de l\'indicateur 27 car sous-traitance = OUI');
                indicator27.classList.remove('inactive');
                indicator27.classList.add('active');
            } else {
                console.log('CORRECTION: Désactivation de l\'indicateur 27 car sous-traitance = NON');
                indicator27.classList.remove('active');
                indicator27.classList.add('inactive');
            }
        }
        
        // Règle pour l'indicateur 28 (spécifique à AFC et question3)
        if (indicator28) {
            // Vérifier si:
            // 1. Le type d'action est AFC
            const afcSelected = isAFCSelected();
            
            // 2. La question3 a la valeur "oui"
            let question3Value = false;
            if (window.userSettings && window.userSettings.question3 === 'oui') {
                question3Value = true;
            }
            
            // Appliquer la règle
            if (afcSelected && question3Value) {
                console.log('CORRECTION: Activation de l\'indicateur 28 car AFC=true et question3=oui');
                indicator28.classList.remove('inactive');
                indicator28.classList.add('active');
            } else {
                console.log('CORRECTION: Désactivation de l\'indicateur 28 car', 
                           afcSelected ? 'question3≠oui' : 'non-AFC');
                indicator28.classList.remove('active');
                indicator28.classList.add('inactive');
            }
        }
        
        // Règle pour l'indicateur 29 (spécifique à CFA)
        if (indicator29) {
            // Vérifier si le type d'action est CFA
            let cfaSelected = false;
            
            // Essayer de récupérer depuis l'élément DOM
            const dashboardElement = document.getElementById('dashboard-container');
            if (dashboardElement && dashboardElement.dataset.orgaInfo) {
                try {
                    const orgaInfo = JSON.parse(dashboardElement.dataset.orgaInfo);
                    if (orgaInfo && orgaInfo.org_cat_act) {
                        let types = [];
                        try {
                            types = JSON.parse(orgaInfo.org_cat_act);
                        } catch (e) {
                            types = [orgaInfo.org_cat_act];
                        }
                        
                        cfaSelected = types.some(type => {
                            const typeStr = String(type).trim().toUpperCase();
                            return typeStr === 'CFA' || 
                                   typeStr.includes('CFA') || 
                                   typeStr.includes('APPRENTISSAGE');
                        });
                    }
                } catch (e) {
                    console.error('Erreur lors de la vérification CFA:', e);
                }
            }
            
            // Appliquer la règle
            if (cfaSelected) {
                console.log('CORRECTION: Activation de l\'indicateur 29 car CFA=true');
                indicator29.classList.remove('inactive');
                indicator29.classList.add('active');
            } else {
                console.log('CORRECTION: Désactivation de l\'indicateur 29 car non-CFA');
                indicator29.classList.remove('active');
                indicator29.classList.add('inactive');
            }
        }
    }

    // Attendre un court délai pour s'assurer que tout est initialisé
    setTimeout(function() {
        try {
            applySpecificIndicatorRules();
            
            // Observer les changements sur les indicateurs pour réappliquer les règles si nécessaire
            const indicatorGrid = document.querySelector('.indicator-grid');
            if (indicatorGrid) {
                const observer = new MutationObserver(function(mutations) {
                    console.log('Changements détectés sur les indicateurs, réapplication des règles...');
                    applySpecificIndicatorRules();
                });
                
                observer.observe(indicatorGrid, { 
                    attributes: true, 
                    childList: true, 
                    subtree: true,
                    attributeFilter: ['class'] 
                });
            }
            
            console.log('Correctif pour les indicateurs initialisé avec succès');
        } catch (e) {
            console.error('Erreur lors de l\'initialisation du correctif:', e);
        }
    }, 500);
});