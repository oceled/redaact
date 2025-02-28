// form-handler.js3
class FormHandler {
    constructor() {
        this.initialize();
    }

    initialize() {
        const form = document.getElementById('FormIndicator');
        if (!form) return;

        // Gestion de la soumission du formulaire
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Gestion du bouton de génération
        const generateButton = document.getElementById('generateButton');
        if (generateButton) {
            generateButton.addEventListener('click', this.handleGenerate.bind(this));
        }
    }

    getSelectedIndicatorNumber() {
        const selectedIndicator = document.querySelector('.indicator-grid .selected');
        return selectedIndicator ? selectedIndicator.getAttribute('data-indicator') : null;
    }

    collectFormData() {
        const indNumb = this.getSelectedIndicatorNumber();
        if (!indNumb) return null;

        return {
            indNumb: parseInt(indNumb),
            indName: document.getElementById('indName').value.trim(),
            indObject: document.getElementById('indObject').value.trim(),
            indDetail: document.getElementById('indDetail').value.trim(),
            indFiles: document.getElementById('indFiles').value.trim(),
            indRedac: document.getElementById('indRedac').value.trim(),
            indApprob: document.getElementById('indApprob').value.trim()
        };
    }

    hasData(formData) {
        return formData.indName || formData.indObject || 
               formData.indDetail || formData.indFiles;
    }

    handleSubmit(event) {
        event.preventDefault();
        const formData = this.collectFormData();
        if (!formData) {
            this.showNotification('error', 'Erreur', 'Aucun indicateur sélectionné');
            return;
        }
        
        // Vérifier d'abord s'il y a des données
        if (!this.hasData(formData)) {
            // Si pas de données, on peut sauvegarder sans rédacteur
            this.processFormSubmission(formData);
            return;
        }

        // Validation du rédacteur uniquement si des données sont présentes
        if (!formData.indRedac) {
            this.showNotification('error', 'Erreur', 'Le rédacteur est obligatoire car des données sont présentes');
            return;
        }

        this.processFormSubmission(formData);
    }

    async processFormSubmission(formData) {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            // Vérification si l'indicateur existe déjà
            const existingIndicator = window.indicators.find(i => i.indNumb === parseInt(formData.indNumb));
            
            if (!existingIndicator) {
                // Première création
                formData.revision = {
                    indRedac: formData.indRedac,
                    indApprob: formData.indApprob,
                    type: 'initial',
                    n_vers: 1
                };
                await this.saveIndicator(formData);
            } else {
                // Modification d'un indicateur existant
                this.showVersionModal(formData);
            }
        } catch (error) {
            this.showNotification('error', 'Erreur', error.message);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    }

    showVersionModal(formData) {
        let modalElement = document.getElementById('versionModal');

        if (!modalElement) {
            // Création de la modal si elle n'existe pas
            document.body.insertAdjacentHTML('beforeend', this.getVersionModalHtml());
            modalElement = document.getElementById('versionModal');

            // Gestionnaire pour le type de version
            modalElement.querySelectorAll('input[name="versionType"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.getElementById('reasonDiv').classList.toggle('d-none', e.target.value !== 'new');
                });
            });
        }

        const modal = new bootstrap.Modal(modalElement);

        // Réinitialisation des champs
        document.getElementById('correction').checked = true;
        document.getElementById('reasonDiv').classList.add('d-none');
        document.getElementById('revisionReason').value = '';

        // Gestion de la confirmation
        const confirmButton = modalElement.querySelector('#confirmVersion');
        confirmButton.onclick = async () => {
            const type = modalElement.querySelector('input[name="versionType"]:checked').value;
            const reason = type === 'new' ? document.getElementById('revisionReason').value.trim() : null;

            if (type === 'new' && !reason) {
                this.showNotification('warning', 'Attention', 'Motif requis pour nouvelle version');
                return;
            }

            formData.revision = {
                indRedac: formData.indRedac,
                indApprob: formData.indApprob,
                type: type,
                reason: reason
            };

            modal.hide();
            await this.saveIndicator(formData);
        };

        // Nettoyage modal
        modalElement.addEventListener('hidden.bs.modal', () => {
            document.body.querySelector('.modal-backdrop')?.remove();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });

        modal.show();
    }

    getVersionModalHtml() {
        return `
            <div class="modal fade" id="versionModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5>Type de modification</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-check mb-3">
                                <input type="radio" id="correction" name="versionType" value="correction" class="form-check-input shadow-soft" checked>
                                <label class="form-check-label" for="correction">Correction de la procédure</label>
                            </div>
                            <div class="form-check">
                                <input type="radio" id="newVersion" name="versionType" value="new" class="form-check-input shadow-soft">
                                <label class="form-check-label" for="newVersion">Nouvelle version</label>
                                <div id="reasonDiv" class="mt-2 d-none">
                                    <input type="text" id="revisionReason" class="form-control" placeholder="Motif">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="confirmVersion">Confirmer</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    async saveIndicator(formData) {
        try {
            const response = await fetch('/indicator/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Si pas de données à sauvegarder, on affiche simplement le message
            if (!data.success && data.message === 'Pas d\'information à enregistrer') {
                this.showNotification('info', 'Information', data.message);
                return data;
            }
            
            // Dans les autres cas d'erreur
            if (!data.success) {
                throw new Error(data.error || 'Erreur lors de la sauvegarde');
            }

            this.updateLocalData(formData);
            this.showNotification('success', 'Succès', 'Informations enregistrées avec succès');
            
            return data;
        } catch (error) {
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }
    }

    updateLocalData(formData) {
        const index = window.indicators.findIndex(i => i.indNumb === parseInt(formData.indNumb));
        
        const updatedIndicator = {
            indNumb: parseInt(formData.indNumb),
            indName: formData.indName,
            indObject: formData.indObject,
            indDetail: formData.indDetail,
            indFiles: formData.indFiles,
            indRedac: formData.indRedac,
            indApprob: formData.indApprob
        };

        if (index !== -1) {
            window.indicators[index] = updatedIndicator;
        } else {
            window.indicators.push(updatedIndicator);
        }
    }

    handleGenerate(event) {
        event.preventDefault();
        const indNumber = this.getSelectedIndicatorNumber();
        
        if (!indNumber) {
            this.showNotification('warning', 'Attention', 'Veuillez sélectionner un indicateur');
            return;
        }

        const indicator = window.indicators.find(i => i.indNumb === parseInt(indNumber));
        
        if (!indicator || this.isIndicatorEmpty(indicator)) {
            const noDataModal = new bootstrap.Modal(document.getElementById('noDataModal'));
            noDataModal.show();
            return;
        }

        window.location.href = `/generate/${indNumber}`;
    }

    isIndicatorEmpty(indicator) {
        return !indicator.indName && !indicator.indObject && 
               !indicator.indDetail && !indicator.indFiles;
    }

    showNotification(type, title, message) {
        if (window.notificationManager) {
            window.notificationManager.show({ type, title, message });
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => new FormHandler());