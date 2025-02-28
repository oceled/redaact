// inddoc-form-handler.js
if (!window.DocFormHandler) {
    class DocFormHandler {
        constructor() {
            this.initializeFormSubmission();
        }

        initializeFormSubmission() {
            const form = document.getElementById('documentForm');
            if (!form) {
                console.error('Formulaire non trouvé');
                return;
            }
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit();
            });
        }

        async handleFormSubmit() {
            try {
                const formData = this.collectFormData();
                console.log('Données collectées:', formData);
                
                const response = await this.saveDocument(formData);
                console.log('Réponse reçue:', response);
                
                this.handleSaveResponse(response);
            } catch (error) {
                console.error('Erreur détaillée:', error);
                alert('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'));
            }
        }

        collectFormData() {
            const fields = ['indd_numb', 'indd_def', 'indd_adv'];
            const formData = {};
            
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (!element) {
                    console.warn(`Champ ${field} non trouvé`);
                    return;
                }
                formData[field] = element.value;
            });
            
            // Assurons-nous que indd_numb est un nombre
            if (formData.indd_numb) {
                formData.indd_numb = parseInt(formData.indd_numb, 10);
            }
            
            return formData;
        }

        async saveDocument(formData) {
            console.log('Envoi vers /adv/save:', formData);
            
            const response = await fetch('/adv/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            console.log('Status de la réponse:', response.status);
            const responseData = await response.json();
            console.log('Données de la réponse:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Erreur lors de l\'enregistrement');
            }

            return responseData;
        }

        handleSaveResponse(data) {
            if (data.success) {
                alert(data.message || 'Document enregistré avec succès');
            } else {
                alert(data.error || 'Erreur lors de l\'enregistrement');
            }
        }
    }

    window.DocFormHandler = DocFormHandler;
}