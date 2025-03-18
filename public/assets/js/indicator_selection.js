/**
 * indicator_selection.js
 * Gestion dynamique des indicateurs pour l'application RED'ACT
 * Version mise à jour avec les nouvelles règles conditionnelles basées sur le type d'action
 */
 
// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si les éléments nécessaires sont présents dans le DOM
    const hasIndicators = document.querySelector('.indicator-grid') !== null;
    
    if (hasIndicators) {
        console.log('Grille d\'indicateurs trouvée, initialisation du module...');
        initializeApplication();
    } else {
        console.log('Aucune grille d\'indicateurs trouvée, module non initialisé');
    }
});

console.log('====== INITIALISATION DU MODULE INDICATEURS QUALIOPI ======');
console.log('Version avec gestion conditionnelle des indicateurs');

// Configuration globale des règles d'indicateurs
const INDICATOR_CONFIG = {
    typeActionRules: {
        AFC: {
            requiredIndicators: [4, 5, 6, 8, 9, 10, 11, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
            enable: {
                1: { 
                    question: "question_1", 
                    condition: "non"
                },
                2: { 
                    question: "question_1", 
                    condition: "non"
                },
                3: { 
                    condition: "combinedOr",
                    questions: [
                        { question: "question_1", condition: "non" },
                        { question: "formationCertifiante", condition: "oui" }
                    ]
                },
                7: { 
                    question: "formationCertifiante", 
                    condition: "oui"
                },
                12: { 
                    question: "question_2", 
                    condition: "non"
                },
                16: { 
                    question: "formationCertifiante", 
                    condition: "oui"
                },
                28: { 
                    question: "question_3", 
                    condition: "oui"
                }
            },
            disable: {
                12: { 
                    question: "question_2", 
                    condition: "oui"
                },
                13: { 
                    question: "question_3", 
                    condition: "non"
                },
                16: { 
                    question: "formationCertifiante", 
                    condition: "non"
                },
                28: { 
                    question: "question_3", 
                    condition: "non"
                }
            }
        },
        CFA: {
            requiredIndicators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32],
            enable: {
                27: { 
                    question: "question_A", 
                    condition: "oui"
                }
            }
        },
        BC: {
            requiredIndicators: [4, 5, 6, 9, 10, 11, 12, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
            enable: {
                1: { 
                    question: "question_1", 
                    condition: "non"
                },
                2: { 
                    question: "question_1", 
                    condition: "non"
                },
                27: { 
                    question: "question_A", 
                    condition: "oui"
                }
            }
        },
        VAE: {
            requiredIndicators: [4, 5, 6, 9, 10, 11, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 30, 31, 32],
            enable: {
                1: { 
                    question: "question_1", 
                    condition: "non"
                },
                2: { 
                    question: "question_1", 
                    condition: "non"
                },
                3: { 
                    condition: "combinedOr",
                    questions: [
                        { question: "question_1", condition: "non" },
                        { question: "formationCertifiante", condition: "oui" }
                    ]
                },
                27: { 
                    question: "question_A", 
                    condition: "oui"
                }
            }
        }
    },
    questionRules: {
        // Questions pour tous les types d'action
        'question1': { 
            'oui': { disableIndicators: [1, 2, 3] },
            'non': { enableIndicators: [1, 2, 3] }
        },
        // Questions spécifiques pour AFC
        'question2': {
            'oui': { disableIndicators: [12] },
            'non': { enableIndicators: [12] }
        },
        'question3': {
            'oui': { enableIndicators: [28] },
            'non': { disableIndicators: [28] }
        },
        // Certification (spécifique pour AFC)
        'certification': {
            'oui': { enableIndicators: [3, 7, 16] },
            'non': { disableIndicators: [3, 7, 16] }
        },
        // Recours à la sous-traitance
        'sousTraitance': {
            'oui': { enableIndicators: [27] },
            'non': { disableIndicators: [27] }
        }
    },
    // Questions qui ne s'appliquent que si AFC est sélectionné
    afcOnlyQuestions: ['question2', 'question3', 'certification']
};

// Variables globales
let orgaInfo = {};
let orgaInfoId = null;
let isNewUser = false;
let settingsSaved = false;
let customQuestionsConfigured = false; // Variable pour suivre si les questions personnalisées ont été configurées

// Ajouter au début de vos fonctions clés
console.log('État des paramètres de sous-traitance:');
console.log('window.userSettings:', window.userSettings);
console.log('app.user.userInfo.orgaInfo.orgSubUse:', document.querySelector('[data-org-sub-use]')?.dataset.orgSubUse);
console.log('Valeur de sousTraitance:', window.userSettings?.sousTraitance);
console.log('Type de sousTraitance:', typeof window.userSettings?.sousTraitance);

/**
 * Initialise l'application et ses écouteurs
 */
function initializeApplication() {
    console.log('Initialisation de indicator_selection.js');
    
    // Initialiser les informations de l'organisme d'abord
    initOrgaInfo();
    
    // Attacher les écouteurs d'événements
    attachEventListeners();
    
    // Réinitialiser tous les indicateurs
    resetAllIndicators();
    
    // Appliquer immédiatement les règles de type d'action si disponibles
    if (orgaInfo && orgaInfo.org_cat_act) {
        console.log('Application immédiate des règles de type d\'action');
        applyTypeActionRules(orgaInfo.org_cat_act);
    }
    
    // Charger et appliquer les paramètres sauvegardés
    loadAndApplySettings();
}

/**
 * Réinitialise tous les indicateurs à leur état par défaut
 */
function resetAllIndicators() {
    console.log('Réinitialisation de tous les indicateurs');
    
    // Mettre tous les indicateurs en état inactif
    const indicators = document.querySelectorAll('.indicator-grid span');
    indicators.forEach(indicator => {
        indicator.classList.remove('active', 'selected');
        indicator.classList.add('inactive');
    });
}

/**
 * Bascule l'état d'un indicateur entre actif et inactif
 * @param {HTMLElement} indicator L'élément indicateur à basculer
 */
function toggleIndicator(indicator) {
    if (!indicator) return;
    
    // Basculer entre actif et inactif
    if (indicator.classList.contains('active')) {
        indicator.classList.remove('active');
        indicator.classList.add('inactive');
    } else {
        indicator.classList.remove('inactive');
        indicator.classList.add('active');
    }
    
    // Ajouter/retirer la classe selected
    indicator.classList.toggle('selected');
    
    console.log(`Indicateur ${indicator.id} basculé: ${indicator.classList.contains('active') ? 'actif' : 'inactif'}`);
}

/**
 * Initialise les informations de l'organisme
 */
function initOrgaInfo() {
    const dashboardElement = document.getElementById('dashboard-container');
    
    if (dashboardElement) {
        // Récupérer l'ID de l'organisme
        orgaInfoId = dashboardElement.dataset.orgaInfoId || null;
        
        // Initialiser l'objet orgaInfo et userSettings
        orgaInfo = {};
        if (!window.userSettings) {
            window.userSettings = {};
        }
        
        // Récupérer les informations de l'organisme
        try {
            if (dashboardElement.dataset.orgaInfo) {
                const orgaInfoData = JSON.parse(dashboardElement.dataset.orgaInfo);
                
                // Fusionner avec orgaInfo
                orgaInfo = {...orgaInfo, ...orgaInfoData};
                
                // Si org_cat_act est une chaîne JSON, la parser
                if (typeof orgaInfo.org_cat_act === 'string') {
                    try {
                        orgaInfo.org_cat_act = JSON.parse(orgaInfo.org_cat_act);
                    } catch (parseError) {
                        console.error('Erreur lors du parsing de org_cat_act:', parseError);
                        // Si le parsing échoue, considérer comme un tableau avec une seule valeur
                        orgaInfo.org_cat_act = [orgaInfo.org_cat_act];
                    }
                }
            }
            
            // Récupérer les informations de sous-traitance et certification depuis le DOM
            const certElement = document.querySelector('#infoModal .mb-3:nth-last-of-type(2) .p_answer');
            if (certElement) {
                const certText = certElement.textContent.trim().toLowerCase();
                window.userSettings.certification = (certText !== 'aucune' && certText !== '') ? 'oui' : 'non';
            }
            
            const subTraitanceElement = document.querySelector('#infoModal .mb-3:last-of-type .p_answer');
            if (subTraitanceElement) {
                const subText = subTraitanceElement.textContent.trim().toLowerCase();
                window.userSettings.sousTraitance = subText.includes('oui') ? 'oui' : 'non';
            }
            
            console.log('Informations organisme initialisées:', orgaInfo);
            console.log('Paramètres utilisateur chargés:', window.userSettings);
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des informations de l\'organisme:', error);
            orgaInfo = { org_cat_act: [] };
        }
    }
}

/**
 * Vérifie si le type d'action AFC est sélectionné
 * @returns {boolean} true si AFC est sélectionné, false sinon
 */
function isAFCSelected() {
    if (!orgaInfo || !orgaInfo.org_cat_act) return false;
    
    const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
    
    return types.some(type => {
        const typeStr = String(type).trim().toUpperCase();
        return typeStr === 'AFC' || typeStr.includes('AFC');
    });
}

/*
 * Vérifie si un type spécifique est sélectionné
 * @param {string} typeToCheck Le type à vérifier
 * @returns {boolean} true si le type est sélectionné, false sinon
 */
function isTypeSelected(typeToCheck) {
    if (!orgaInfo || !orgaInfo.org_cat_act) {
        console.log(`Type ${typeToCheck} non sélectionné: aucune information d'organisation`);
        return false;
    }
    
    // Normaliser les types en tableau
    const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
    
    // Normaliser le type à vérifier
    const normalizedTypeToCheck = typeToCheck.trim().toUpperCase();
    
    // Vérifier chaque type dans le tableau
    const isSelected = types.some(type => {
        if (!type) return false;
        
        // Convertir en chaîne et normaliser
        const typeStr = String(type).trim().toUpperCase();
        
        // Vérifier les correspondances selon les différentes conventions
        if (normalizedTypeToCheck === 'AFC') {
            return typeStr === 'AFC' || typeStr.includes('AFC');
        } else if (normalizedTypeToCheck === 'CFA') {
            return typeStr === 'CFA' || typeStr.includes('CFA') || typeStr.includes('APPRENTISSAGE');
        } else if (normalizedTypeToCheck === 'BC') {
            return typeStr === 'BC' || typeStr.includes('BC') || typeStr.includes('BILAN');
        } else if (normalizedTypeToCheck === 'VAE') {
            return typeStr === 'VAE' || typeStr.includes('VAE');
        }
        
        // Si on cherche un type exact, vérifier l'égalité
        return typeStr === normalizedTypeToCheck;
    });
    
    console.log(`Vérification du type ${typeToCheck}: ${isSelected ? 'sélectionné' : 'non sélectionné'}`);
    return isSelected;
}

/**
 * Vérifie si l'organisme possède des certifications
 * @returns {boolean} true si l'organisme a au moins une certification, false sinon
 */
function hasCertification() {
    console.log('Vérification des certifications');
    
    // 1. Vérifier d'abord dans les userSettings (prioritaire)
    if (window.userSettings && window.userSettings.certification !== undefined) {
        const hasCert = window.userSettings.certification === 'oui' || 
                      window.userSettings.certification === true || 
                      window.userSettings.certification === 1 || 
                      window.userSettings.certification === '1';
        console.log(`Certification depuis userSettings: ${hasCert ? 'oui' : 'non'}`);
        return hasCert;
    }
    
    // 2. Vérifier dans les informations de l'organisme (orgCert)
    if (orgaInfo && orgaInfo.orgCert !== undefined) {
        // Si orgCert est un tableau, vérifier s'il contient au moins un élément
        if (Array.isArray(orgaInfo.orgCert)) {
            const hasCert = orgaInfo.orgCert.length > 0;
            console.log(`Certification depuis orgaInfo (tableau): ${hasCert ? 'oui' : 'non'}`);
            return hasCert;
        }
        // Si orgCert est une chaîne, vérifier si elle n'est pas vide et différente de "aucune"
        else if (typeof orgaInfo.orgCert === 'string') {
            const hasCert = orgaInfo.orgCert.trim() !== '' && 
                           orgaInfo.orgCert.trim().toLowerCase() !== 'aucune';
            console.log(`Certification depuis orgaInfo (chaîne): ${hasCert ? 'oui' : 'non'}`);
            return hasCert;
        }
        // Si orgCert est un booléen, le retourner directement
        else if (typeof orgaInfo.orgCert === 'boolean') {
            console.log(`Certification depuis orgaInfo (booléen): ${orgaInfo.orgCert ? 'oui' : 'non'}`);
            return orgaInfo.orgCert;
        }
        // Si orgCert est un nombre, vérifier s'il est différent de 0
        else if (typeof orgaInfo.orgCert === 'number') {
            const hasCert = orgaInfo.orgCert !== 0;
            console.log(`Certification depuis orgaInfo (nombre): ${hasCert ? 'oui' : 'non'}`);
            return hasCert;
        }
    }
    
    // 3. Vérifier via le DOM si l'information est disponible
    const certElement = document.querySelector('#infoModal .mb-3:nth-last-of-type(2) .p_answer');
    if (certElement) {
        const certText = certElement.textContent.trim().toLowerCase();
        const hasCert = certText !== 'aucune' && certText !== '';
        console.log(`Certification depuis le DOM: ${hasCert ? 'oui' : 'non'}`);
        return hasCert;
    }
    
    // 4. Dernière méthode: vérifier si des cases à cocher pour certification sont sélectionnées
    const certCheckboxes = document.querySelectorAll('input[name="orgaInfo[orgCert][]"]:checked');
    if (certCheckboxes && certCheckboxes.length > 0) {
        console.log(`Certification depuis checkboxes: oui (${certCheckboxes.length} sélectionnées)`);
        return true;
    }
    
    // 5. Vérifier si la question 4 (certification) dans le modal a été répondue
    const certOuiRadio = document.getElementById('cert-oui');
    if (certOuiRadio && certOuiRadio.checked) {
        console.log('Certification depuis question modale: oui');
        return true;
    }
    
    // Par défaut, retourner false si aucune information n'a été trouvée
    console.log('Aucune information de certification trouvée, retour false par défaut');
    return false;
}

/**
 * Vérifie si la sous-traitance est activée
 * @returns {boolean} true si la sous-traitance est activée, false sinon
 */
function isSubcontractingEnabled() {
    console.log('Vérification du statut de sous-traitance...');
    
    // 1. Vérifier d'abord dans userSettings (prioritaire)
    if (window.userSettings && window.userSettings.sousTraitance !== undefined) {
        const hasSubcontracting = window.userSettings.sousTraitance === 'oui' || 
                                window.userSettings.sousTraitance === true || 
                                window.userSettings.sousTraitance === 1 || 
                                window.userSettings.sousTraitance === '1';
        console.log(`Sous-traitance depuis userSettings: ${hasSubcontracting ? 'oui' : 'non'}`);
        return hasSubcontracting;
    }
    
    // 2. Vérifier via le DOM dans le modal
    const subTraitanceElement = document.querySelector('#infoModal .mb-3:last-of-type .p_answer');
    if (subTraitanceElement) {
        const text = subTraitanceElement.textContent.trim().toLowerCase();
        const hasSubcontracting = text.includes('oui');
        console.log(`Sous-traitance depuis le DOM: ${hasSubcontracting ? 'oui' : 'non'}`);
        return hasSubcontracting;
    }
    
    // 3. Vérifier dans les infos de l'organisme si disponible
    if (orgaInfo && orgaInfo.orgSubUse !== undefined) {
        const hasSubcontracting = orgaInfo.orgSubUse === true || 
                                orgaInfo.orgSubUse === 1 || 
                                orgaInfo.orgSubUse === 'oui' || 
                                orgaInfo.orgSubUse === '1';
        console.log(`Sous-traitance depuis orgaInfo: ${hasSubcontracting ? 'oui' : 'non'}`);
        return hasSubcontracting;
    }
    
    // Par défaut, retourner false si aucune information n'a été trouvée
    console.log('Aucune information de sous-traitance trouvée, retour false par défaut');
    return false;
}

/**
 * Vérifie si une condition est remplie
 * @param {string} questionKey La clé de la question à vérifier
 * @param {string} expectedValue La valeur attendue
 * @returns {boolean} true si la condition est remplie, false sinon
 */
function checkCondition(questionKey, expectedValue) {
    console.log(`Vérification de la condition: ${questionKey} = ${expectedValue}`);
    
    // Cas spécial pour la certification
    if (questionKey === 'formationCertifiante') {
        const hasCert = hasCertification();
        const result = (expectedValue === 'oui' && hasCert) || (expectedValue === 'non' && !hasCert);
        console.log(`Vérification certification: ${hasCert} (attendu: ${expectedValue}) => ${result}`);
        return result;
    }
    
    // Cas spécial pour la sous-traitance
    if (questionKey === 'question_A' || questionKey === 'sousTraitance') {
        const hasSubcontracting = isSubcontractingEnabled();
        const result = (expectedValue === 'oui' && hasSubcontracting) || (expectedValue === 'non' && !hasSubcontracting);
        console.log(`Vérification sous-traitance: ${hasSubcontracting} (attendu: ${expectedValue}) => ${result}`);
        return result;
    }
    
    // Pour les questions standard, vérifier la réponse dans userSettings
    if (window.userSettings) {
        // Normaliser la clé de question (enlever 'question_' si présent)
        const normalizedKey = questionKey.replace('question_', 'question');
        
        // Vérifier si la réponse correspond à la valeur attendue
        if (window.userSettings[normalizedKey] !== undefined) {
            const userValue = window.userSettings[normalizedKey];
            // Normaliser la valeur pour la comparaison (convertir booléen en 'oui'/'non' si nécessaire)
            const normalizedUserValue = typeof userValue === 'boolean' 
                ? (userValue ? 'oui' : 'non') 
                : userValue;
                
            const result = normalizedUserValue === expectedValue;
            console.log(`Vérification ${normalizedKey}: ${normalizedUserValue} (attendu: ${expectedValue}) => ${result}`);
            return result;
        }
    }
    
    // Par défaut, si on ne peut pas vérifier, on renvoie false
    console.log(`Impossible de vérifier la condition ${questionKey} = ${expectedValue}, retour false par défaut`);
    return false;
}

/**
 * Vérifie si la sous-traitance est activée, en se basant sur le DOM
 * @returns {boolean} true si la sous-traitance est activée, false sinon
 */
function isSubcontractingEnabled() {
    console.log('Vérification du statut de sous-traitance...');
    
    // Méthode 1: Vérifier directement dans le modal infoModal
    const subTraitanceElement = document.querySelector('#infoModal .mb-3:last-of-type .p_answer');
    if (subTraitanceElement) {
        const text = subTraitanceElement.textContent.trim();
        console.log('Texte trouvé dans le modal:', text);
        if (text.toLowerCase().includes('oui')) {
            console.log('Sous-traitance = OUI détectée depuis le texte affiché');
            return true;
        }
    }
    
    // Si userSettings existe et contient déjà l'information
    if (window.userSettings && window.userSettings.sousTraitance !== undefined) {
        const hasSubcontracting = window.userSettings.sousTraitance === 'oui' || 
                                 window.userSettings.sousTraitance === true || 
                                 window.userSettings.sousTraitance === 1 || 
                                 window.userSettings.sousTraitance === '1';
        console.log(`Sous-traitance depuis userSettings: ${hasSubcontracting ? 'oui' : 'non'}`);
        return hasSubcontracting;
    }
    
    console.log('Aucune sous-traitance détectée');
    return false;
}

/**
 * Applique les règles conditionnelles aux indicateurs
 * @param {Object} rules Les règles à appliquer
 * @param {boolean} enableMode true pour activer, false pour désactiver
 */
function applyConditionalRules(rules, enableMode) {
    console.log(`Application des règles conditionnelles (mode: ${enableMode ? 'activation' : 'désactivation'})`);
    
    // Parcourir toutes les règles
    Object.keys(rules).forEach(indNum => {
        const rule = rules[indNum];
        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
        
        if (!indicator) {
            console.warn(`Indicateur ind_${String(indNum).padStart(2, '0')} non trouvé dans le DOM`);
            return;
        }
        
        // Vérifier si l'indicateur est dans la liste des indicateurs requis pour le type d'action actuel
        let isRequired = false;
        if (orgaInfo && orgaInfo.org_cat_act) {
            const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
            types.forEach(type => {
                const typeStr = String(type).trim().toUpperCase();
                if (typeStr === 'AFC' && INDICATOR_CONFIG.typeActionRules.AFC.requiredIndicators.includes(parseInt(indNum))) {
                    isRequired = true;
                } else if ((typeStr === 'CFA' || typeStr.includes('APPRENTISSAGE')) && INDICATOR_CONFIG.typeActionRules.CFA.requiredIndicators.includes(parseInt(indNum))) {
                    isRequired = true;
                } else if ((typeStr === 'BC' || typeStr.includes('BILAN')) && INDICATOR_CONFIG.typeActionRules.BC.requiredIndicators.includes(parseInt(indNum))) {
                    isRequired = true;
                } else if (typeStr === 'VAE' && INDICATOR_CONFIG.typeActionRules.VAE.requiredIndicators.includes(parseInt(indNum))) {
                    isRequired = true;
                }
            });
        }
        
        // Vérifier si la condition est remplie
        let conditionMet = false;
        
        if (rule.condition === "combinedOr" && rule.questions) {
            // Condition combinée OU - au moins une des conditions doit être satisfaite
            conditionMet = rule.questions.some(q => checkCondition(q.question, q.condition));
            console.log(`Condition combinée OU pour ind_${indNum}: ${conditionMet}`);
        } else if (rule.condition === "combinedAnd" && rule.questions) {
            // Condition combinée ET - toutes les conditions doivent être satisfaites
            conditionMet = rule.questions.every(q => checkCondition(q.question, q.condition));
            console.log(`Condition combinée ET pour ind_${indNum}: ${conditionMet}`);
        } else {
            // Condition simple
            conditionMet = checkCondition(rule.question, rule.condition);
            console.log(`Condition simple pour ind_${indNum}: ${rule.question} = ${rule.condition} => ${conditionMet}`);
        }
        
        // Appliquer l'activation/désactivation selon le résultat et la priorité
        if (conditionMet) {
            if (enableMode) {
                // Si c'est une règle d'activation et la condition est remplie, activer l'indicateur
                console.log(`Activation de l'indicateur ind_${String(indNum).padStart(2, '0')}`);
                indicator.classList.remove('inactive');
                indicator.classList.add('active');
            } else if (!isRequired) {
                // Si c'est une règle de désactivation, ne l'appliquer que si l'indicateur n'est pas requis
                console.log(`Désactivation de l'indicateur ind_${String(indNum).padStart(2, '0')}`);
                indicator.classList.remove('active');
                indicator.classList.add('inactive');
            } else {
                console.log(`L'indicateur ind_${String(indNum).padStart(2, '0')} est requis, impossible de le désactiver`);
            }
        }
    });
}

/**
 * Applique les règles basées sur les réponses aux questions
 * @param {Object} settings Les paramètres contenant les réponses
 */
function applyQuestionRules(settings) {
    console.log('Application des règles basées sur les questions', settings);
    
    // Pour chaque question configurée
    Object.keys(INDICATOR_CONFIG.questionRules).forEach(questionId => {
        const rules = INDICATOR_CONFIG.questionRules[questionId];
        
        // Vérifier si une réponse existe pour cette question
        if (settings[questionId] !== undefined) {
            const answer = typeof settings[questionId] === 'boolean' 
                         ? (settings[questionId] ? 'oui' : 'non') 
                         : settings[questionId];
            
            console.log(`Question ${questionId}: réponse = ${answer}`);
            
            // Si une règle existe pour cette réponse
            if (rules[answer]) {
                // Activer les indicateurs spécifiés
                if (rules[answer].enableIndicators) {
                    rules[answer].enableIndicators.forEach(indNum => {
                        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                        if (indicator) {
                            console.log(`Activation de l'indicateur ${indNum} par règle de question`);
                            indicator.classList.remove('inactive');
                            indicator.classList.add('active');
                        }
                    });
                }
                
                // Avant de désactiver un indicateur, vérifier s'il est requis pour le type d'action actuel
if (rules[answer].disableIndicators) {
    rules[answer].disableIndicators.forEach(indNum => {
        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
        if (indicator) {
            // Vérifier si l'indicateur est requis pour le type d'action actuel
            let isRequired = false;
            if (orgaInfo && orgaInfo.org_cat_act) {
                const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
                types.forEach(type => {
                    const typeStr = String(type).trim().toUpperCase();
                    if (typeStr === 'AFC' && INDICATOR_CONFIG.typeActionRules.AFC.requiredIndicators.includes(indNum)) {
                        isRequired = true;
                    } else if ((typeStr === 'CFA' || typeStr.includes('APPRENTISSAGE')) && INDICATOR_CONFIG.typeActionRules.CFA.requiredIndicators.includes(indNum)) {
                        isRequired = true;
                    } else if ((typeStr === 'BC' || typeStr.includes('BILAN')) && INDICATOR_CONFIG.typeActionRules.BC.requiredIndicators.includes(indNum)) {
                        isRequired = true;
                    } else if (typeStr === 'VAE' && INDICATOR_CONFIG.typeActionRules.VAE.requiredIndicators.includes(indNum)) {
                        isRequired = true;
                    }
                });
            }
            
            // Ne désactiver que si l'indicateur n'est pas requis
            if (!isRequired) {
                console.log(`Désactivation de l'indicateur ${indNum} par règle de question`);
                indicator.classList.remove('active');
                indicator.classList.add('inactive');
            } else {
                console.log(`L'indicateur ${indNum} est requis, impossible de le désactiver par règle de question`);
            }
        }
    });
}
            }
        }
    });
    
    // Marquer que les questions ont été configurées
    customQuestionsConfigured = true;
    
    // Traitement spécial pour l'indicateur 27 basé sur la sous-traitance
    const indicator27 = document.getElementById('ind_27');
    if (indicator27) {
        const usesSubcontracting = isSubcontractingEnabled();
        if (usesSubcontracting) {
            indicator27.classList.remove('inactive');
            indicator27.classList.add('active');
            console.log('Indicateur 27 activé car sous-traitance = oui');
        } else {
            indicator27.classList.remove('active');
            indicator27.classList.add('inactive');
            console.log('Indicateur 27 désactivé car sous-traitance = non');
        }
    }
}

/**
 * Applique les règles basées sur les types d'action
 * @param {string|Array} typeAction Types d'action de l'organisme
 */
function applyTypeActionRules(typeAction) {
    console.log('Application des règles de type d\'action:', typeAction);
    
    // Normaliser typeAction en tableau
    const types = Array.isArray(typeAction) ? typeAction : [typeAction];
    console.log('Types d\'action détectés:', types);
    
    // Désactiver TOUS les indicateurs d'abord
    for (let i = 1; i <= 32; i++) {
        const indicator = document.getElementById(`ind_${String(i).padStart(2, '0')}`);
        if (indicator) {
            indicator.classList.remove('active');
            indicator.classList.add('inactive');
        }
    }
    
    // Pour chaque type d'action sélectionné
    types.forEach(type => {
        const typeStr = String(type).trim().toUpperCase();
        let typeConfig = null;
        
        // Identifier la configuration correspondante
        if (typeStr === 'AFC' || typeStr.includes('AFC')) {
            typeConfig = INDICATOR_CONFIG.typeActionRules.AFC;
            console.log('Type AFC détecté');
        } else if (typeStr === 'CFA' || typeStr.includes('CFA') || typeStr.includes('APPRENTISSAGE')) {
            typeConfig = INDICATOR_CONFIG.typeActionRules.CFA;
            console.log('Type CFA détecté');
        } else if (typeStr === 'BC' || typeStr.includes('BC') || typeStr.includes('BILAN')) {
            typeConfig = INDICATOR_CONFIG.typeActionRules.BC;
            console.log('Type BC détecté');
        } else if (typeStr === 'VAE' || typeStr.includes('VAE')) {
            typeConfig = INDICATOR_CONFIG.typeActionRules.VAE;
            console.log('Type VAE détecté');
        } else {
            console.warn('Type non reconnu:', typeStr);
            return;
        }
        
        // Activer les indicateurs requis - CETTE PARTIE EST PRIORITAIRE
        if (typeConfig && typeConfig.requiredIndicators) {
            console.log('Indicateurs requis pour ce type:', typeConfig.requiredIndicators);
            typeConfig.requiredIndicators.forEach(indNum => {
                const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                if (indicator) {
                    console.log(`Activation de l'indicateur requis ind_${String(indNum).padStart(2, '0')}`);
                    indicator.classList.remove('inactive');
                    indicator.classList.add('active');
                }
            });
        }
        
        // Appliquer les règles conditionnelles d'activation
        if (typeConfig && typeConfig.enable) {
            console.log('Application des règles conditionnelles d\'activation');
            applyConditionalRules(typeConfig.enable, true);
        }
        
        // Appliquer les règles conditionnelles de désactivation
        // Note: les indicateurs requis ne seront pas désactivés grâce à la vérification dans applyConditionalRules
        if (typeConfig && typeConfig.disable) {
            console.log('Application des règles conditionnelles de désactivation');
            applyConditionalRules(typeConfig.disable, false);
        }
    });
    
    // Traitements spéciaux pour certains indicateurs après l'application des règles générales
    
    // Cas spécial pour l'indicateur 27 (sous-traitance)
    const indicator27 = document.getElementById('ind_27');
    if (indicator27) {
        const usesSubcontracting = isSubcontractingEnabled();
        if (usesSubcontracting) {
            console.log('Activation spéciale de l\'indicateur 27 car sous-traitance = oui');
            indicator27.classList.remove('inactive');
            indicator27.classList.add('active');
        } else {
            // Vérifier si l'indicateur 27 est requis pour un des types d'action actifs
            let isRequired27 = false;
            types.forEach(type => {
                const typeStr = String(type).trim().toUpperCase();
                if ((typeStr === 'CFA' || typeStr.includes('CFA') || typeStr.includes('APPRENTISSAGE')) && 
                    INDICATOR_CONFIG.typeActionRules.CFA.requiredIndicators.includes(27)) {
                    isRequired27 = true;
                }
            });
            
            if (!isRequired27) {
                console.log('Désactivation spéciale de l\'indicateur 27 car sous-traitance = non');
                indicator27.classList.remove('active');
                indicator27.classList.add('inactive');
            }
        }
    }
    
    // Afficher l'état final des indicateurs pour faciliter le débogage
    logIndicatorsState('Après application des règles de type d\'action');
}

/**
 * Applique les règles conditionnelles aux indicateurs
 * @param {Object} rules Les règles à appliquer
 * @param {boolean} enableMode true pour activer, false pour désactiver
 */


/**
 * Charge et applique les paramètres sauvegardés
 */
function loadAndApplySettings() {
    console.log('Chargement et application des paramètres sauvegardés');
    
    // Vérifie si l'ID de l'organisme est disponible
    if (!orgaInfoId) {
        console.warn('Impossible de charger les paramètres: ID organisme manquant');
        return;
    }
    
    // Charger les paramètres depuis le serveur
    fetch(`/get-settings?orgaInfoId=${orgaInfoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            return response.json();
        })
        .then(data => {
            if (data && Object.keys(data).length > 0) {
                // Convertir les valeurs booléennes en 'oui'/'non'
                const formattedSettings = {};
                for (const key in data) {
                    if (typeof data[key] === 'boolean') {
                        formattedSettings[key] = data[key] ? 'oui' : 'non';
                    } else {
                        formattedSettings[key] = data[key];
                    }
                }
                
                // Sauvegarder les paramètres dans window.userSettings
                window.userSettings = formattedSettings;
                
                // Appliquer les paramètres aux indicateurs
                applySettingsToIndicators(formattedSettings);
                
                isNewUser = false;
            } else {
                console.log('Aucun paramètre trouvé, l\'utilisateur est considéré comme nouveau');
                isNewUser = true;
                
                // Si c'est un nouvel utilisateur, vérifier quand même si des certifications ou sous-traitance existent
                window.userSettings = {
                    certification: hasCertification() ? 'oui' : 'non',
                    sousTraitance: isSubcontractingEnabled() ? 'oui' : 'non'
                };
                
                // Appliquer les paramètres par défaut
                applySettingsToIndicators(window.userSettings);
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des paramètres:', error);
            console.warn('Utilisation des paramètres par défaut');
            
            // En cas d'erreur, utiliser des paramètres par défaut
            window.userSettings = {
                certification: hasCertification() ? 'oui' : 'non',
                sousTraitance: isSubcontractingEnabled() ? 'oui' : 'non'
            };
            
            // Appliquer les paramètres par défaut
            applySettingsToIndicators(window.userSettings);
        });
}

/**
 * Applique les paramètres aux indicateurs
 * @param {Object} settings Les paramètres à appliquer
 */
function applySettingsToIndicators(settings) {
    // Protection contre les appels récursifs
    if (window.isApplyingSettings) {
        console.warn('Prévention d\'un appel récursif à applySettingsToIndicators');
        return;
    }
    
    window.isApplyingSettings = true;
    console.log('Paramètres reçus pour application:', settings);
    
    try {
        // Normaliser les paramètres
        const formattedSettings = {};
        Object.keys(settings).forEach(key => {
            if (key.startsWith('question') || key === 'certification' || key === 'sousTraitance') {
                if (typeof settings[key] === 'boolean') {
                    formattedSettings[key] = settings[key] ? 'oui' : 'non';
                } else if (typeof settings[key] === 'string') {
                    formattedSettings[key] = settings[key];
                }
            } else {
                formattedSettings[key] = settings[key];
            }
        });
        
        // Fusionner avec les paramètres existants pour préserver les valeurs manquantes
        if (window.userSettings) {
            Object.keys(window.userSettings).forEach(key => {
                if (!formattedSettings[key]) {
                    formattedSettings[key] = window.userSettings[key];
                }
            });
        }
        
        // Mettre à jour les paramètres globaux
        window.userSettings = formattedSettings;
        console.log('Paramètres utilisateur mis à jour:', window.userSettings);
        
        // 1. D'abord, réinitialiser tous les indicateurs
        resetAllIndicators();
        
        // 2. Appliquer les règles de type d'action qui définissent les indicateurs de base requis
        if (orgaInfo && orgaInfo.org_cat_act) {
            applyTypeActionRules(orgaInfo.org_cat_act);
        }
        
        // 3. Capturer l'état des indicateurs après l'application des règles de type d'action
        // pour préserver les indicateurs requis
        const requiredIndicatorsState = {};
        for (let i = 1; i <= 32; i++) {
            const indicator = document.getElementById(`ind_${String(i).padStart(2, '0')}`);
            if (indicator) {
                requiredIndicatorsState[i] = indicator.classList.contains('active');
            }
        }
        
        // 4. Appliquer les règles des questions qui peuvent modifier des indicateurs
        applyQuestionRules(formattedSettings);
        
        // 5. Restaurer l'état des indicateurs requis pour s'assurer qu'ils sont toujours actifs
        if (orgaInfo && orgaInfo.org_cat_act) {
            const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
            types.forEach(type => {
                const typeStr = String(type).trim().toUpperCase();
                let requiredIndicators = [];
                
                if (typeStr === 'AFC' || typeStr.includes('AFC')) {
                    requiredIndicators = INDICATOR_CONFIG.typeActionRules.AFC.requiredIndicators;
                } else if (typeStr === 'CFA' || typeStr.includes('CFA') || typeStr.includes('APPRENTISSAGE')) {
                    requiredIndicators = INDICATOR_CONFIG.typeActionRules.CFA.requiredIndicators;
                } else if (typeStr === 'BC' || typeStr.includes('BC') || typeStr.includes('BILAN')) {
                    requiredIndicators = INDICATOR_CONFIG.typeActionRules.BC.requiredIndicators;
                } else if (typeStr === 'VAE' || typeStr.includes('VAE')) {
                    requiredIndicators = INDICATOR_CONFIG.typeActionRules.VAE.requiredIndicators;
                }
                
                requiredIndicators.forEach(indNum => {
                    const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                    if (indicator && !indicator.classList.contains('active')) {
                        console.log(`Restauration de l'indicateur requis ${indNum} qui a été désactivé`);
                        indicator.classList.remove('inactive');
                        indicator.classList.add('active');
                    }
                });
            });
        }
        
        // 6. Appliquer les règles spéciales pour certains indicateurs
        applySpecialCases(formattedSettings);
        
        // Afficher l'état final des indicateurs pour faciliter le débogage
        logIndicatorsState('État final après application des paramètres');
    } finally {
        // S'assurer que le drapeau est réinitialisé même en cas d'erreur
        window.isApplyingSettings = false;
    }
}

/**
 * Applique les règles spéciales pour certains indicateurs
 * @param {Object} settings Les paramètres
 */
function applySpecialCases(settings) {
    console.log('Application des règles spéciales pour certains indicateurs');
    
    // Traitement spécial pour l'indicateur 3 (condition combinée pour AFC et VAE)
    const indicator3 = document.getElementById('ind_03');
    if (indicator3 && (isTypeSelected('AFC') || isTypeSelected('VAE'))) {
        const question1Condition = settings.question1 === 'non';
        const hasCert = hasCertification();
        
        if (question1Condition || hasCert) {
            console.log('Activation spéciale de l\'indicateur 3 car condition combinée satisfaite');
            indicator3.classList.remove('inactive');
            indicator3.classList.add('active');
        }
    }
    
    // Traitement spécial pour l'indicateur 16 (certification)
    const indicator16 = document.getElementById('ind_16');
    if (indicator16) {
        if (isTypeSelected('VAE') || isTypeSelected('CFA')) {
            // Pour VAE et CFA, l'indicateur 16 est toujours requis
            console.log('Activation inconditionnelle de l\'indicateur 16 pour VAE/CFA');
            indicator16.classList.remove('inactive');
            indicator16.classList.add('active');
        } else if (isTypeSelected('AFC')) {
            // Pour AFC, l'indicateur 16 dépend de la certification
            const hasCert = hasCertification();
            if (hasCert) {
                console.log('Activation de l\'indicateur 16 pour AFC car certification = oui');
                indicator16.classList.remove('inactive');
                indicator16.classList.add('active');
            } else {
                console.log('Désactivation de l\'indicateur 16 pour AFC car certification = non');
                indicator16.classList.remove('active');
                indicator16.classList.add('inactive');
            }
        }
    }
    
    // Traitement spécial pour l'indicateur 27 (sous-traitance)
    const indicator27 = document.getElementById('ind_27');
    if (indicator27) {
        const usesSubcontracting = isSubcontractingEnabled();
        if (usesSubcontracting) {
            console.log('Activation de l\'indicateur 27 car sous-traitance = oui');
            indicator27.classList.remove('inactive');
            indicator27.classList.add('active');
        } else {
            // Vérifier si l'indicateur 27 n'est pas requis par ailleurs
            let isRequired27 = false;
            if (orgaInfo && orgaInfo.org_cat_act) {
                const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
                types.forEach(type => {
                    const typeStr = String(type).trim().toUpperCase();
                    if ((typeStr === 'CFA' || typeStr.includes('CFA') || typeStr.includes('APPRENTISSAGE')) && 
                        INDICATOR_CONFIG.typeActionRules.CFA.requiredIndicators.includes(27)) {
                        isRequired27 = true;
                    }
                });
            }
            
            if (!isRequired27) {
                console.log('Désactivation de l\'indicateur 27 car sous-traitance = non');
                indicator27.classList.remove('active');
                indicator27.classList.add('inactive');
            }
        }
    }
}
function attachEventListeners() {
    console.log('Attachement des écouteurs d\'événements');
    // Ajouter ici les écouteurs d'événements nécessaires
    // Par exemple, pour les clics sur les indicateurs
    const indicators = document.querySelectorAll('.indicator-grid span');
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            toggleIndicator(this);
        });
    });
}
// Ajouter un log pour vérifier
console.log('Type d\'action détecté (brut):', orgaInfo.org_cat_act);
const types = Array.isArray(orgaInfo.org_cat_act) ? orgaInfo.org_cat_act : [orgaInfo.org_cat_act];
console.log('Types d\'action normalisés:', types);
// Ajouter cette fonction pour tracer l'état des indicateurs
function logIndicatorsState(message) {
    console.log(`--- État des indicateurs: ${message} ---`);
    for (let i = 1; i <= 32; i++) {
        const indicator = document.getElementById(`ind_${String(i).padStart(2, '0')}`);
        if (indicator) {
            console.log(`Indicateur ${i}: ${indicator.classList.contains('active') ? 'actif' : 'inactif'}`);
        }
    }
    console.log('-----------------------------------');
}