if (!window.DocManager) {
    class DocManager {
        constructor(inddocs) {
            this.inddocs = inddocs;
            this.initializeEventListeners();
            this.loadDocData(1);
        }

        loadDocData(indNumber) {
            indNumber = parseInt(indNumber);
            const doc = this.inddocs.find(doc => parseInt(doc.indNumb) === indNumber);

            document.querySelector('.CurrentInd').textContent = String(indNumber).padStart(2, '0');
            this.updateFormFields(doc, indNumber);
            this.updateSelectedIndicator(indNumber);
        }

        updateFormFields(doc, indNumber) {
            const fields = ['indd_def', 'indd_adv'];
            fields.forEach(field => {
                document.getElementById(field).value = doc ? doc[field] || '' : '';
            });
            document.getElementById('indd_numb').value = indNumber;
        }

        updateSelectedIndicator(indNumber) {
            document.querySelectorAll('.indicator-item').forEach(item => {
                item.classList.toggle('selected', parseInt(item.textContent) === indNumber);
            });
        }

        initializeEventListeners() {
            document.querySelectorAll('.indicator-item').forEach(item => {
                item.addEventListener('click', () => {
                    const indNumber = parseInt(item.textContent);
                    this.loadDocData(indNumber);
                });
            });
        }
    }

    window.DocManager = DocManager;
}