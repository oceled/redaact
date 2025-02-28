// indicator-manager.js
if (!window.IndicatorManager) {
    class IndicatorManager {
        constructor(indicators) {
			this.indicators = indicators || [];
			this.indDocs = window.indDocs || [];
			this.emptyValues = [
				null,
				undefined,
				'',
				'<p><br></p>',
				'<p></p>',
				'Pas d\'information fournie'
			];
			
			this.initEventListeners();
			
			const checkQuill = () => {
				if (window.quillManager && window.quillManager.editors['indObject']) {
					// Charger les données mais ne pas modifier l'état actif/inactif
					this.loadIndicatorData(1, true); // true signifie "ne pas toucher à l'état actif/inactif"
				} else {
					setTimeout(checkQuill, 100);
				}
			};
			checkQuill();
		}

        isFieldEmpty(value) {
            return !value || 
                   this.emptyValues.includes(value.toString().trim()) || 
                   value.toString().trim() === '' ||
                   value.toString().trim().toLowerCase() === '<p></p>' || 
                   value.toString().trim().toLowerCase() === '<p><br></p>';
        }

        initEventListeners() {
            // Sélectionner tous les indicateurs dans la grille
             document.querySelectorAll('.indicator-grid span').forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    const indNumber = parseInt(e.target.getAttribute('data-indicator'));
                    if (!isNaN(indNumber)) {
                        this.loadIndicatorData(indNumber);
                    }
                });
            });
        }

        loadIndicatorData(indNumber, preserveActiveState = false) {
			indNumber = parseInt(indNumber);
			const indicator = this.indicators.find(ind => parseInt(ind.indNumb) === indNumber);
			const indDoc = this.indDocs.find(doc => parseInt(doc.inddNumb) === indNumber);
			
			document.querySelector('.CurrentInd').textContent = String(indNumber).padStart(2, '0');
			
			this.updateFormFields(indicator, indNumber);
			this.updateAccordionContents(indDoc);
			
			// Mise à jour de la sélection mais sans toucher aux états actif/inactif si preserveActiveState est true
			document.querySelectorAll('.indicator-grid span').forEach(indicator => {
				indicator.classList.remove('selected');
				if (parseInt(indicator.getAttribute('data-indicator')) === indNumber) {
					indicator.classList.add('selected');
				}
			});
		}

        updateFormFields(indicator, indNumber) {
            if (!window.quillManager) return;
    
            const standardFields = {
                'indName': 'Pas d\'information fournie',
                'indRedac': 'Pas d\'information fournie',
                'indApprob': 'Pas d\'information fournie'
            };
    
            // Mise à jour des champs standards
            Object.entries(standardFields).forEach(([fieldId, defaultMessage]) => {
                const element = document.getElementById(fieldId);
                if (element) {
                    const value = indicator && !this.isFieldEmpty(indicator[fieldId]) ? 
                                indicator[fieldId] : '';
                    element.value = value;
                    element.setAttribute('placeholder', value ? 'Pas d\'information fournie' : defaultMessage);
                }
            });

            // Mise à jour des champs Quill
            const quillFields = ['indObject', 'indVoc', 'indDetail', 'indFiles'];
            
            quillFields.forEach(fieldId => {
                const editor = window.quillManager.editors[fieldId];
                if (!editor) return;

                if (indicator && !this.isFieldEmpty(indicator[fieldId])) {
                    const content = indicator[fieldId].toString().trim();
                    editor.root.innerHTML = content;
                    editor.update();
                } else {
                    editor.setContents([{ insert: '\n' }]);
                }
            });

            // Mise à jour du champ caché indNumb
            document.getElementById('indNumb').value = indNumber;
        }

        updateAccordionContents(indDoc) {
            const definitionContent = document.getElementById('definition-content');
            const adviceContent = document.getElementById('advice-content');
            
            if (definitionContent) {
                definitionContent.innerHTML = indDoc?.inddDef || 'Aucune définition disponible';
            }
            
            if (adviceContent) {
                adviceContent.innerHTML = indDoc?.inddAdv || 'Aucun conseil disponible';
            }
        }

        updateSelectedIndicator(indNumber) {
			// Mise à jour de la sélection visuelle dans la grille sans toucher aux états actif/inactif
			document.querySelectorAll('.indicator-grid span').forEach(indicator => {
				indicator.classList.remove('selected');
				if (parseInt(indicator.getAttribute('data-indicator')) === indNumber) {
					indicator.classList.add('selected');
					// Ne pas toucher aux classes active/inactive ici
				}
			});
		}
    }

    window.IndicatorManager = IndicatorManager;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.indicators) {
        window.indicatorManager = new IndicatorManager(window.indicators);
    }
});