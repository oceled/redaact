/**
 * indicator_selection.js
 * Gestion dynamique des indicateurs pour l'application RED'ACT
 */

// Configuration des règles d'indicateurs
const INDICATOR_CONFIG = {
    typeActionRules: {
        AFC: [4, 5, 6, 8, 9, 10, 11, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
        CFA: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32],
        BC: [4, 5, 6, 9, 10, 11, 12, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
        VAE: [4, 5, 6, 9, 10, 11, 12, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32]
    },
    questionRules: {
        'question1': { 
            'oui': { enableIndicators: [1, 2, 3] },
            'non': {}
        },
        'question2': {
            'non': { disableIndicators: [7, 16] },
            'oui': {}
        },
        'question3': {
            'oui': { enableIndicators: [12] },
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
            'non': { disableIndicators: [28] },
            'oui': {}
        }
    }
};

// État global de l'application
class IndicatorState {
    constructor() {
        this.orgaInfo = null;
        this.orgaInfoId = null;
        this.isNewUser = false;
        this.settingsSaved = false;
        this.indicatorsInitialized = false;
    }

    reset() {
        this.orgaInfo = null;
        this.orgaInfoId = null;
        this.isNewUser = false;
        this.settingsSaved = false;
        this.indicatorsInitialized = false;
    }
}

// Gestionnaire principal des indicateurs
class IndicatorManager {
    constructor() {
        this.state = new IndicatorState();
        this.initializeApplication();
    }

    /**
     * Initialisation complète de l'application
     */
    initializeApplication() {
        console.log('🚀 Initialisation de l\'application d\'indicateurs');
        
        this.attachEventListeners();
        this.initOrgaInfo();
        
        // Gestion robuste de l'initialisation
        this.setupInitializationWatcher();
    }

    /**
     * Initialisation des informations de l'organisme
     */
    initOrgaInfo() {
        const dashboardElement = document.getElementById('dashboard-container');
        
        if (!dashboardElement) {
            console.error('Élément du tableau de bord non trouvé');
            return;
        }

        this.state.orgaInfoId = dashboardElement.dataset.orgaInfoId || null;
        const orgaInfoData = dashboardElement.dataset.orgaInfo;

        try {
            this.state.orgaInfo = orgaInfoData ? JSON.parse(orgaInfoData) : null;
        } catch (error) {
            console.error('Erreur de parsing des informations d\'organisme', error);
        }

        if (this.state.orgaInfoId && this.state.orgaInfo) {
            this.fetchOrgaDetails();
        }
    }

    /**
     * Récupère les détails complets de l'organisme
     */
    fetchOrgaDetails() {
        fetch(`/get-orga-info?orgaInfoId=${this.state.orgaInfoId}`)
            .then(response => response.json())
            .then(data => {
                console.log('📋 Informations organisme complètes:', data);
                this.state.orgaInfo = data;
                this.applyTypeActionRules();
                this.loadAndApplySettings();
            })
            .catch(error => {
                console.error('❌ Erreur lors du chargement des infos organisme:', error);
                this.setupFallbackInitialization();
            });
    }

    /**
     * Configuration d'un observateur d'initialisation avec repli
     */
    setupInitializationWatcher() {
        let attempts = 0;
        const maxAttempts = 5;

        const initializationInterval = setInterval(() => {
            if (this.state.indicatorsInitialized || attempts >= maxAttempts) {
                clearInterval(initializationInterval);
                return;
            }

            console.log(`🕒 Tentative d'initialisation ${attempts + 1}`);
            
            if (this.state.orgaInfo && this.state.orgaInfo.org_cat_act) {
                this.applyTypeActionRules();
                this.updateIndicatorVisibility();
                this.state.indicatorsInitialized = true;
            }

            attempts++;
        }, 1000);
    }

    /**
     * Configuration de repli en cas d'échec de chargement
     */
    setupFallbackInitialization() {
        console.warn('🚨 Initialisation de repli');
        
        // Logique de repli minimale
        const indicators = document.querySelectorAll('.indicator-grid span');
        indicators.forEach(indicator => {
            indicator.classList.remove('inactive');
            indicator.classList.add('active');
        });
    }

    /**
     * Application des règles selon le type d'action
     */
    applyTypeActionRules() {
        if (!this.state.orgaInfo || !this.state.orgaInfo.org_cat_act) {
            console.warn('Informations organisme insuffisantes');
            return;
        }

        const types = Array.isArray(this.state.orgaInfo.org_cat_act) 
            ? this.state.orgaInfo.org_cat_act 
            : [this.state.orgaInfo.org_cat_act];

        const indicatorsToEnable = new Set();

        types.forEach(type => {
            const normalizedType = String(type).toUpperCase();
            
            let actionIndicators = [];
            if (normalizedType.includes('AFC')) actionIndicators = INDICATOR_CONFIG.typeActionRules.AFC;
            else if (normalizedType.includes('CFA') || normalizedType.includes('APPRENTISSAGE')) actionIndicators = INDICATOR_CONFIG.typeActionRules.CFA;
            else if (normalizedType.includes('BC') || normalizedType.includes('CBC') || normalizedType.includes('BILAN')) actionIndicators = INDICATOR_CONFIG.typeActionRules.BC;
            else if (normalizedType.includes('VAE')) actionIndicators = INDICATOR_CONFIG.typeActionRules.VAE;

            actionIndicators.forEach(ind => indicatorsToEnable.add(ind));
        });

        // Désactiver tous, puis activer uniquement les indicateurs spécifiés
        const allIndicators = document.querySelectorAll('.indicator-grid span');
        allIndicators.forEach(indicator => {
            indicator.classList.remove('active');
            indicator.classList.add('inactive');
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
     * Mise à jour de la visibilité des indicateurs
     */
    updateIndicatorVisibility() {
        const indicators = document.querySelectorAll('.indicator-grid span');
        indicators.forEach(indicator => {
            if (!indicator.classList.contains('inactive')) {
                indicator.classList.add('active');
            }
        });
    }

    /**
     * Chargement et application des paramètres
     */
    loadAndApplySettings() {
        if (!this.state.orgaInfoId) {
            console.warn('ID organisme manquant pour charger les paramètres');
            return;
        }

        fetch(`/get-settings?orgaInfoId=${this.state.orgaInfoId}`)
            .then(response => response.json())
            .then(data => {
                const settings = data.settings || data;
                
                if (settings && Object.keys(settings).length > 0) {
                    this.applySettingsToIndicators(settings);
                    this.state.isNewUser = false;
                } else {
                    this.state.isNewUser = true;
                }
            })
            .catch(error => {
                console.error('Erreur de chargement des paramètres:', error);
            });
    }

    /**
     * Application des paramètres aux indicateurs
     * @param {Object} settings - Paramètres à appliquer
     */
    applySettingsToIndicators(settings) {
        // Réinitialiser les indicateurs
        this.applyTypeActionRules();

        // Appliquer les règles spécifiques des questions
        Object.keys(INDICATOR_CONFIG.questionRules).forEach(questionKey => {
            const response = settings[questionKey];
            if (!response) return;

            const ruleSet = INDICATOR_CONFIG.questionRules[questionKey][response.toLowerCase()];
            if (!ruleSet) return;

            // Désactiver les indicateurs
            if (ruleSet.disableIndicators) {
                ruleSet.disableIndicators.forEach(indNum => {
                    const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                    if (indicator) {
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
                        indicator.classList.remove('inactive');
                        indicator.classList.add('active');
                    }
                });
            }
        });
    }

    /**
     * Attache les écouteurs d'événements globaux
     */
    attachEventListeners() {
        const settingsBtn = document.getElementById('settingsBtn');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const indicators = document.querySelectorAll('.indicator-grid span');
        const settingModal = document.getElementById('SettingModal');

        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettingsModal());
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.handleSettingsSave());
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => this.toggleIndicator(indicator));
        });

        if (settingModal) {
            settingModal.addEventListener('hidden.bs.modal', () => this.handleModalClose());
        }
    }

    // ... (autres méthodes comme openSettingsModal, handleSettingsSave, etc. restent similaires)
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.indicatorManager = new IndicatorManager();
});