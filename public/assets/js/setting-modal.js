/**
 * Script de correction pour setting-modal.js
 * Ce script résout le problème d'ouverture du modal de paramètres
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif pour setting-modal.js');
    
    // Définir correctement la fonction d'ouverture du modal de paramètres
    window.openSettingsModal = function() {
        console.log('Tentative d\'ouverture du modal de paramètres');
        
        const settingModal = document.getElementById('SettingModal');
        if (settingModal) {
            // S'assurer qu'il n'y a pas de backdrop résiduel avant d'ouvrir le modal
            removeAllModalsAndBackdrops();
            
            // Utiliser l'API Bootstrap pour ouvrir le modal
            const modal = new bootstrap.Modal(settingModal);
            modal.show();
            console.log('Modal de paramètres ouvert avec succès');
        } else {
            console.error('Modal de paramètres non trouvé dans le DOM');
        }
    };
    
    // Connexion correcte du bouton de paramètres flottant
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        console.log('Bouton de paramètres trouvé, ajout de l\'écouteur d\'événement');
        settingsBtn.addEventListener('click', function() {
            console.log('Clic sur le bouton de paramètres');
            window.openSettingsModal();
        });
    } else {
        console.warn('Bouton de paramètres non trouvé dans le DOM');
    }
    
    // Fonction améliorée pour nettoyer tous les modals et backdrops
    function removeAllModalsAndBackdrops() {
        console.log('Nettoyage de tous les modals et backdrops');
        
        // Fermer tous les modals Bootstrap actifs
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modalElement => {
            try {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            } catch (error) {
                console.warn('Erreur lors de la fermeture d\'un modal:', error);
            }
        });
        
        // Supprimer tous les backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Nettoyer les classes et styles du body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
    
    // Remplacer la fonction window.removeModalBackdrop par notre version améliorée
    window.removeModalBackdrop = removeAllModalsAndBackdrops;
    
    // Gérer correctement les boutons de fermeture du modal
    const closeButtons = document.querySelectorAll('#SettingModal .btn-close, #SettingModal button[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const settingModal = document.getElementById('SettingModal');
            if (settingModal) {
                const modalInstance = bootstrap.Modal.getInstance(settingModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            // Nettoyer après la fermeture
            setTimeout(removeAllModalsAndBackdrops, 300);
        });
    });
    
    // Initialiser les événements de sauvegarde des paramètres
    initSaveSettings();
    
    console.log('Correctif pour setting-modal.js chargé avec succès');
});

// Fonction pour initialiser la sauvegarde des paramètres
function initSaveSettings() {
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        console.log('Initialisation du bouton de sauvegarde des paramètres');
        
        saveSettingsBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Clic sur le bouton de sauvegarde des paramètres');
            
            // Récupérer les valeurs du formulaire
            const settings = {
                question1: document.querySelector('input[name="question1"]:checked')?.value || null,
                question2: document.querySelector('input[name="question2"]:checked')?.value || null,
                question3: document.querySelector('input[name="question3"]:checked')?.value || null,
                certification: document.querySelector('input[name="certification"]:checked')?.value || null,
                orgaInfo: {
                    id: document.getElementById('dashboard-container')?.dataset.orgaInfoId || null
                }
            };
            
            console.log('Paramètres à sauvegarder:', settings);
            
            // Envoyer les données au serveur
            fetch('/save-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Réponse du serveur:', data);
                
                // Afficher une notification de succès
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Paramètres sauvegardés avec succès', 'success');
                } else {
                    alert('Paramètres sauvegardés avec succès');
                }
                
                // Fermer le modal
                const settingModal = document.getElementById('SettingModal');
                if (settingModal) {
                    const modalInstance = bootstrap.Modal.getInstance(settingModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
                
                // Actualiser les indicateurs si window.userSettings existe
                if (window.userSettings) {
                    // Mettre à jour les paramètres utilisateur
                    window.userSettings.question1 = settings.question1;
                    window.userSettings.question2 = settings.question2;
                    window.userSettings.question3 = settings.question3;
                    window.userSettings.certification = settings.certification;
                    
                    // Appliquer les nouveaux paramètres aux indicateurs si la fonction existe
                    if (typeof window.applySettingsToIndicators === 'function') {
                        window.applySettingsToIndicators(window.userSettings);
                    }
                }
            })
            .catch(error => {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
                
                // Afficher une notification d'erreur
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Erreur lors de la sauvegarde des paramètres', 'error');
                } else {
                    alert('Erreur lors de la sauvegarde des paramètres');
                }
            });
        });
    } else {
        console.warn('Bouton de sauvegarde des paramètres non trouvé');
    }
}