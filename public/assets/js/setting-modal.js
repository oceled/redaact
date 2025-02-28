document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de setting-modal.js');
    
    // Gestionnaire pour les boutons
    const settingsBtn = document.querySelector('.settings-btn');
    const helpBtn = document.querySelector('.help-btn');
    const saveSettingsBtn = document.getElementById('saveSettings');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log('Ouverture du modal des paramètres');
            const settingModal = new bootstrap.Modal(document.getElementById('SettingModal'));
            settingModal.show();
        });
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
            helpModal.show();
        });
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            saveSettings();
        });
    }
    
    // Fonction de sauvegarde des paramètres
    function saveSettings() {
        console.log('Sauvegarde des paramètres');
        
        try {
            // 1. Récupérer les réponses
            const responses = {};
            for (let i = 1; i <= 10; i++) {
                const radioName = `question${i}`;
                const selectedRadio = document.querySelector(`input[name="${radioName}"]:checked`);
                responses[radioName] = selectedRadio ? selectedRadio.value : null;
            }
            console.log('Réponses collectées:', responses);
            
            // 2. Trouver l'ID de l'organisme
            const orgaInfoId = 3; // ID trouvé dans les logs
            
            // 3. Convertir les valeurs "oui"/"non" en booléens pour le backend
            const settings = {};
            for (let i = 1; i <= 10; i++) {
                const questionKey = `question${i}`;
                if (questionKey in responses) {
                    // Convertir "oui" en true et "non" en false
                    settings[questionKey] = responses[questionKey] === 'oui';
                }
            }
            
            // 4. Ajouter l'ID de l'organisme
            settings.orgaInfo = { id: orgaInfoId };
            
            console.log('Données envoyées au serveur:', settings);
            
            // 5. Sauvegarde en base de données
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
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Paramètres sauvegardés en base de données:', data);
                
                // 6. Appliquer les paramètres aux indicateurs
                applySettingsToIndicators(responses);
                
                // 7. Notification de succès
                alert('Paramètres sauvegardés avec succès');
                
                // 8. Marquer comme sauvegardé pour éviter la restauration
                window.settingsSaved = true;
            })
            .catch(error => {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Erreur lors de la sauvegarde: ' + error.message);
            })
            .finally(() => {
                // 9. Fermer et nettoyer le modal
                closeModal();
            });
        } catch (error) {
            console.error('Erreur lors du processus de sauvegarde:', error);
            alert('Une erreur est survenue: ' + error.message);
            closeModal();
        }
    }
    
    // Fonction pour fermer proprement le modal
    function closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('SettingModal'));
        if (modal) {
            modal.hide();
            
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                    backdrop.remove();
                });
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
            }, 300);
        }
    }
    
    // Fonction pour appliquer les paramètres aux indicateurs
    function applySettingsToIndicators(settings) {
    console.log('Application des paramètres aux indicateurs:', settings);
    
    // Liste exhaustive des règles de désactivation
    const indicatorRules = {
        'question1': { 
            'non': { disableIndicators: [16, 17, 18] } 
        },
        'question2': { 
            'non': { disableIndicators: [8, 9, 10] } 
        },
        'question3': { 
            'oui': { disableIndicators: [1, 2, 3] },
            'non': { disableIndicators: [19, 20, 21] } 
        },
        'question4': { 
            'non': { 
                disableIndicators: [13, 28],
                enableIndicators: [] 
            } 
        },
        'question5': { 
            'non': { disableIndicators: [27] } 
        },
        'question6': { 
            'non': { disableIndicators: [4, 7, 14, 15] } 
        },
        'question7': { 
            'oui': { enableIndicators: [12] } 
        },
        'question9': { 
            'non': { disableIndicators: [7, 16] } 
        },
        'question10': { 
            'non': { disableIndicators: [28] } 
        }
    };

    // Réinitialiser tous les indicateurs
    document.querySelectorAll('.indicator-grid span').forEach(indicator => {
        indicator.classList.remove('inactive');
        indicator.classList.add('active');
        indicator.style.opacity = '1';
    });

    // Appliquer les règles de désactivation
    Object.keys(indicatorRules).forEach(questionKey => {
        const response = settings[questionKey];
        
        if (response) {
            const rules = indicatorRules[questionKey][response.toLowerCase()];
            
            if (rules) {
                // Désactiver les indicateurs
                if (rules.disableIndicators) {
                    rules.disableIndicators.forEach(indNum => {
                        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                        if (indicator) {
                            indicator.classList.remove('active');
                            indicator.classList.add('inactive');
                            indicator.style.opacity = '0.5';
                        }
                    });
                }

                // Activer des indicateurs spécifiques
                if (rules.enableIndicators) {
                    rules.enableIndicators.forEach(indNum => {
                        const indicator = document.getElementById(`ind_${String(indNum).padStart(2, '0')}`);
                        if (indicator) {
                            indicator.classList.remove('inactive');
                            indicator.classList.add('active');
                            indicator.style.opacity = '1';
                        }
                    });
                }
            }
        }
    });

    // Mettre à jour la visibilité
    window.updateIndicatorVisibility();
}
    
    // Charger les paramètres au chargement de la page
    function loadSettings() {
        console.log('Chargement des paramètres');
        
        // Récupérer l'ID de l'organisme
        const orgaInfoId = 3; // ID trouvé dans les logs
        
        fetch(`/get-settings?orgaInfoId=${orgaInfoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Paramètres récupérés:', data);
                
                // Si aucune donnée n'est retournée, ne rien faire
                if (!data || Object.keys(data).length === 0) {
                    console.log('Aucun paramètre trouvé');
                    return;
                }
                
                // Remplir le formulaire avec les réponses
                for (let i = 1; i <= 10; i++) {
                    const questionKey = `question${i}`;
                    if (questionKey in data) {
                        // Convertir les booléens en "oui"/"non"
                        const value = data[questionKey] === true ? 'oui' : 'non';
                        const radio = document.querySelector(`input[name="${questionKey}"][value="${value}"]`);
                        if (radio) {
                            radio.checked = true;
                        }
                    }
                }
                
                // Convertir les valeurs booléennes en oui/non pour l'application aux indicateurs
                const formattedSettings = {};
                for (let i = 1; i <= 10; i++) {
                    const questionKey = `question${i}`;
                    if (questionKey in data) {
                        formattedSettings[questionKey] = data[questionKey] === true ? 'oui' : 'non';
                    }
                }
                
                // Appliquer les paramètres aux indicateurs
                applySettingsToIndicators(formattedSettings);
            })
            .catch(error => {
                console.error('Erreur lors du chargement des paramètres:', error);
            });
    }
    
    // Écouter l'événement d'ouverture du modal pour sauvegarder l'état des indicateurs
    const settingModal = document.getElementById('SettingModal');
    if (settingModal) {
        settingModal.addEventListener('show.bs.modal', function() {
            if (typeof window.saveCurrentIndicatorState === 'function') {
                window.saveCurrentIndicatorState();
            }
            window.settingsSaved = false;
        });
        
        // Écouter l'événement de fermeture du modal pour restaurer l'état si nécessaire
        settingModal.addEventListener('hidden.bs.modal', function() {
            if (!window.settingsSaved && typeof window.restorePreviousIndicatorState === 'function') {
                window.restorePreviousIndicatorState();
            }
        });
    }
    
    // Charger les paramètres au démarrage
    loadSettings();
    
    // Exposer les fonctions globalement pour le débogage et l'interopérabilité
    window.applySettingsToIndicators = applySettingsToIndicators;
    window.saveSettings = saveSettings;
    window.loadSettings = loadSettings;
});