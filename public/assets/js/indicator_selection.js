/**
 * indicator_selection.js
 * Gestion dynamique des indicateurs pour l'application RED'ACT
 */

// Configuration globale des règles d'indicateurs
const INDICATOR_CONFIG = {
    typeActionRules: {
        AFC: [5, 6, 8, 9, 10, 11, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
        CFA: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32],
        BC: [5, 6, 9, 10, 11, 12, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
        VAE: [5, 6, 9, 10, 11, 12, 16, 21, 22, 23, 24, 25, 26, 30, 31, 32]
    },
    questionRules: {
        'question1': { 
            'oui': { disableIndicators: [20] },
            'non': {}
        },
        'question2': {
            'non': { disableIndicators: [27] },
            'oui': {}
        },
        'question3': {
            'oui': { enableIndicators: [1, 2, 3] },
            'non': {}
        },
        'question4': {
            'non': { disableIndicators: [13, 28] },
            'oui': {}
        },
        'question5': {
            'non': { disableIndicators: [27] },
            'oui': {}
        },
        'question6': {
            'non': { disableIndicators: [4] },
            'oui': {}
        },
        'question7': {
            'oui': { enableIndicators: [12] },
            'non': {}
        },
        'question9': {
            'non': { disableIndicators: [7, 16] },
            'oui': {}
        },
        'question10': {
            'non': { disableIndicators: [28] },
            'oui': {}
        }
    }
};
// Variables globales
let orgaInfo = {};
let orgaInfoId = null;
let isNewUser = false;
let settingsSaved = false;

/**
 * Initialise l'application et ses écouteurs
 */
function initializeApplication() {
    console.log('Initialisation de indicator_selection.js');
    
    // Initialiser les informations de l'organisme
    initOrgaInfo();
    
    // Attacher les écouteurs d'événements
    attachEventListeners();
    
    // Réinitialiser tous les indicateurs
    resetAllIndicators();
    
    // Charger et appliquer les paramètres sauvegardés
    loadAndApplySettings();
}

/**
 * Initialise les informations de l'organisme
 */
function initOrgaInfo() {
    const dashboardElement = document.getElementById('dashboard-container');
    
    if (dashboardElement) {
        // Récupérer l'ID de l'organisme
        orgaInfoId = dashboardElement.dataset.orgaInfoId || null;
        
        // Récupérer les informations de l'organisme
        try {
            orgaInfo = JSON.parse(dashboardElement.dataset.orgaInfo || '{}');
        } catch (error) {
            console.error('Erreur lors du parsing des informations de l\'organisme:', error);
        }
    }
}

/**
 * Attache les écouteurs d'événements
 */
function attachEventListeners() {
    // Écouteur pour le bouton des paramètres
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }
    
    // Écouteur pour le bouton de sauvegarde des paramètres
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSettingsSave);
    }
    
    // Écouteur pour les clics sur les indicateurs
    const indicators = document.querySelectorAll('.indicator-grid span');
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            toggleIndicator(this);
        });
    });
    
    // Gestion des événements du modal
    const settingModal = document.getElementById('SettingModal');
    if (settingModal) {
        settingModal.addEventListener('hidden.bs.modal', handleModalClose);
    }
}

/**
 * Ouvre le modal des paramètres
 */
function openSettingsModal() {
    // Réinitialiser le flag de sauvegarde
    settingsSaved = false;
    
    // Charger les valeurs actuelles dans le formulaire
    loadSettingsIntoForm();
    
    // Sauvegarder l'état actuel des indicateurs
    saveCurrentIndicatorState();
    
    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('SettingModal'));
    modal.show();
}

/**
 * Gère la sauvegarde des paramètres
 */
function handleSettingsSave() {
    // Vérifier que l'ID de l'organisme est disponible
    if (!orgaInfoId) {
        showNotification('Erreur: Impossible d\'identifier l\'organisme.', 'error');
        return;
    }
    
    // Collecter les réponses aux questions
    const settings = collectSettingsFromForm();
    
    // Ajouter l'ID de l'organisme
    settings.orgaInfo = { id: orgaInfoId };
    
    // Marquer comme sauvegardé
    settingsSaved = true;
    
    // Sauvegarder côté serveur
    saveSettingsToServer(settings);
}

/**
 * Gère la fermeture du modal
 */
function handleModalClose() {
    // Restaurer l'état précédent si pas de sauvegarde
    if (!settingsSaved) {
        restorePreviousIndicatorState();
    }
    
    // Réinitialiser le flag de sauvegarde
    settingsSaved = false;
}

/**
 * Collecte les réponses du formulaire
 * @returns {Object} Les paramètres collectés
 */
function collectSettingsFromForm() {
    const settings = {};
    
    // Récupérer toutes les questions du formulaire
    const questions = document.querySelectorAll('#SettingModal input[type="radio"]:checked');
    
    questions.forEach(radio => {
        const questionName = radio.getAttribute('name');
        settings[questionName] = radio.value;
    });
    
    return settings;
}

/**
 * Charge les paramètres dans le formulaire
 */
function loadSettingsIntoForm() {
    if (!orgaInfoId) {
        console.warn('Impossible de charger les paramètres: ID organisme manquant');
        return;
    }
    
    fetch(`/get-settings?orgaInfoId=${orgaInfoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            return response.json();
        })
        .then(data => {
            if (data && Object.keys(data).length > 0) {
                // Remplir le formulaire avec les réponses
                for (let i = 1; i <= 10; i++) {
                    const questionKey = `question${i}`;
                    const value = data[questionKey] === true ? 'oui' : 'non';
                    const radio = document.querySelector(`input[name="${questionKey}"][value="${value}"]`);
                    if (radio) {
                        radio.checked = true;
                    }
                }
                isNewUser = false;
            } else {
                isNewUser = true;
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des paramètres:', error);
            showNotification('Erreur lors du chargement des paramètres', 'error');
        });
}

/**
 * Sauvegarde les paramètres côté serveur
 * @param {Object} settings Les paramètres à sauvegarder
 */
function saveSettingsToServer(settings) {
    fetch('/save-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(settings)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        return response.json();
    })
    .then(data => {
        // Appliquer les paramètres aux indicateurs
        applySettingsToIndicators(settings);
        
        // Notification de succès
        showNotification('Paramètres sauvegardés avec succès', 'success');
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('SettingModal'));
        if (modal) {
            modal.hide();
        }
    })
    .catch(error => {
        console.error('Erreur lors de la sauvegarde:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    });
}

/**
 * Applique les paramètres aux indicateurs
 * @param {Object} settings Les paramètres à appliquer
 */
function applySettingsToIndicators(settings) {
    console.log('Paramètres reçus pour application:', settings);
    
    // Réinitialiser tous les indicateurs
    resetAllIndicators();
    
    // Appliquer les règles de type d'action
    if (orgaInfo && orgaInfo.org_cat_act) {
        applyTypeActionRules(orgaInfo.org_cat_act);
    }
    
    // Convertir les booléens en 'oui'/'non' si nécessaire
    const formattedSettings = {};
    Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'boolean') {
            formattedSettings[key] = settings[key] ? 'oui' : 'non';
        } else {
            formattedSettings[key] = settings[key];
        }
    });
    
    // Appliquer les règles des questions
    applyQuestionRules(formattedSettings);
}
/**
 * Applique les règles basées sur le type d'action
 * @param {string|Array} typeAction Type d'action de l'organisme
 */
function applyTypeActionRules(typeAction) {
    const types = Array.isArray(typeAction) ? typeAction : [typeAction];
    const indicatorsToEnable = new Set();
    
    types.forEach(type => {
        let actionIndicators = [];
        
        if (type.includes('AFC')) actionIndicators = INDICATOR_CONFIG.typeActionRules.AFC;
        else if (type.includes('CFA') || type.includes('apprentissage')) actionIndicators = INDICATOR_CONFIG.typeActionRules.CFA;
        else if (type.includes('BC') || type.includes('Bilan')) actionIndicators = INDICATOR_CONFIG.typeActionRules.BC;
        else if (type.includes('VAE')) actionIndicators = INDICATOR_CONFIG.typeActionRules.VAE;
        
        actionIndicators.forEach(ind => indicatorsToEnable.add(ind));
    });
    
    indicatorsToEnable.forEach(indNum => {
        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
        if (indicator) {
            indicator.classList.remove('inactive');
            indicator.classList.add('active');
        }
    });
}

/**
 * Applique les règles basées sur les réponses aux questions
 * @param {Object} settings Les paramètres contenant les réponses
 */
function applyQuestionRules(settings) {
    console.log('Application des règles des questions:', settings);
    
    Object.keys(INDICATOR_CONFIG.questionRules).forEach(questionKey => {
        const response = settings[questionKey];
        
        console.log(`Traitement de ${questionKey}: ${response}`);
        
        if (response) {
            const ruleSet = INDICATOR_CONFIG.questionRules[questionKey][response.toLowerCase()];
            
            console.log('Règles à appliquer:', ruleSet);
            
            // Désactiver les indicateurs
            if (ruleSet.disableIndicators) {
                ruleSet.disableIndicators.forEach(indNum => {
                    const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                    if (indicator) {
                        console.log(`Désactivation de l'indicateur ind_${String(indNum).padStart(2, '0')}`);
                        indicator.classList.remove('active');
                        indicator.classList.add('inactive');
                    }
                });
            }
            
            // Activer les indicateurs
            if (ruleSet.enableIndicators) {
                ruleSet.enableIndicators.forEach(indNum => {
                    const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                    if (indicator) {
                        console.log(`Activation de l'indicateur ind_${String(indNum).padStart(2, '0')}`);
                        indicator.classList.remove('inactive');
                        indicator.classList.add('active');
                    }
                });
            }
        }
    });
}

/**
 * Réinitialise tous les indicateurs à l'état actif
 */
function resetAllIndicators() {
    const indicators = document.querySelectorAll('.indicator-grid span');
    
    indicators.forEach(indicator => {
        indicator.classList.remove('inactive');
        indicator.classList.add('active');
    });
}

/**
 * Sauvegarde l'état actuel des indicateurs
 */
function saveCurrentIndicatorState() {
    window.previousIndicatorState = [];
    
    const indicators = document.querySelectorAll('.indicator-grid span');
    indicators.forEach(indicator => {
        window.previousIndicatorState.push({
            id: indicator.id,
            classes: [...indicator.classList]
        });
    });
}

/**
 * Restaure l'état précédent des indicateurs
 */
function restorePreviousIndicatorState() {
    if (!window.previousIndicatorState || window.previousIndicatorState.length === 0) {
        return;
    }
    
    window.previousIndicatorState.forEach(state => {
        const indicator = document.getElementById(state.id);
        if (indicator) {
            indicator.className = '';
            state.classes.forEach(className => {
                indicator.classList.add(className);
            });
        }
    });
}

/**
 * Bascule l'état d'un indicateur
 * @param {HTMLElement} indicator L'indicateur à basculer
 */
function toggleIndicator(indicator) {
    if (indicator.classList.contains('active')) {
        indicator.classList.remove('active');
        indicator.classList.add('inactive');
    } else {
        indicator.classList.remove('inactive');
        indicator.classList.add('active');
    }
}

/**
 * Charge et applique les paramètres sauvegardés
 */
function loadAndApplySettings() {
    if (!orgaInfoId) {
        console.warn('Impossible de charger les paramètres: ID organisme manquant');
        return;
    }
    
    fetch(`/get-settings?orgaInfoId=${orgaInfoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');