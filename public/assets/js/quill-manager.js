class QuillManager {
    constructor() {
        // Configuration par défaut pour Quill
        this.defaultOptions = {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'header': [1, 2, 3, false] }],
                    ['link'],
                    ['clean']
                ]
            },
            placeholder: 'Pas d\'information fournie'
        };

        // Les champs qui auront l'éditeur Quill
        this.editableFields = ['indObject', 'indVoc', 'indDetail','indFiles'];
        this.standardFields = ['indNumb', 'indName', 'indRedac', 'indApprob'];
        this.editors = {};
        this.originalTextareas = {};
    }

    loadQuillCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Taille des boutons et icônes */
            .ql-snow .ql-toolbar button {
                height: 25px;
                width: 25px;
                padding: 2px;
            }
            
            .ql-snow .ql-toolbar button svg {
                width: 21px !important;
                height: 21px !important;
            }
            
            /* Espacement des boutons */
            .ql-toolbar.ql-snow .ql-formats {
                margin-right: 12px;
            }
            
            /* Style de la barre d'outils */
            .ql-toolbar.ql-snow {
                padding: 6px 8px;
            }
        `;
        document.head.appendChild(style);
    }

    loadQuillJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    init() {
        // Charger Quill CSS et styles personnalisés
        this.loadQuillCSS();
        this.addCustomStyles();
        
        // Attendre que Quill soit chargé
        this.loadQuillJS().then(() => {
            this.initializeEditors();
            this.setupStandardFieldPlaceholders();
            this.setupFormHandler();
        }).catch(error => {
            console.error('Erreur lors du chargement de Quill:', error);
        });
    }

    setupStandardFieldPlaceholders() {
        console.log('Configuration des placeholders...');
        const allFields = [...this.standardFields, ...this.editableFields];
        
        allFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                console.log(`Champ trouvé: ${fieldId}`);
                
                // Utiliser setAttribute pour les placeholders
                field.setAttribute('placeholder', this.defaultOptions.placeholder);
                
                // Ajout d'un écouteur pour le cas où le placeholder ne s'afficherait pas
                field.addEventListener('focus', () => {
                    if (!field.value) {
                        field.setAttribute('placeholder', this.defaultOptions.placeholder);
                    }
                });
                
                // Vérification et log
                console.log(`Placeholder de ${fieldId} défini à: ${field.getAttribute('placeholder')}`);
            } else {
                console.warn(`Champ non trouvé: ${fieldId}`);
            }
        });
    }

    setupFormHandler() {
        const form = document.getElementById('indicatorForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.editableFields.forEach(fieldId => {
                    const editor = this.editors[fieldId];
                    const textarea = this.originalTextareas[fieldId];
                    if (editor && textarea) {
                        textarea.value = editor.root.innerHTML;
                    }
                });
            });
        }
    }

    initializeEditors() {
        this.editableFields.forEach(fieldId => {
            const textarea = document.getElementById(fieldId);
            if (textarea) {
                // Sauvegarder la référence au textarea original
                this.originalTextareas[fieldId] = textarea;

                // Créer un conteneur pour l'éditeur
                const container = document.createElement('div');
                container.id = `${fieldId}-editor`;
                textarea.parentNode.insertBefore(container, textarea);
                textarea.style.display = 'none';

                // Initialiser l'éditeur Quill avec les options par défaut
                const editor = new Quill(`#${fieldId}-editor`, this.defaultOptions);
                this.editors[fieldId] = editor;

                // Définir le contenu initial s'il existe
                if (textarea.value.trim()) {
                    editor.root.innerHTML = textarea.value;
                }

                // Gérer les changements en temps réel
                editor.on('text-change', (delta, oldDelta, source) => {
                    if (source === 'user') {
                        const content = editor.root.innerHTML;
                        textarea.value = content;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            }
        });
    }

    updateContent(fieldId, content) {
        const editor = this.editors[fieldId];
        if (editor) {
            if (!content || content.includes('Aucun')) {
                editor.setText('');
            } else {
                editor.root.innerHTML = content;
                const textarea = this.originalTextareas[fieldId];
                if (textarea) {
                    textarea.value = content;
                }
                editor.update();
            }
        }
    }

    // Méthode pour récupérer le contenu - nécessaire pour form-handler.js
    getContent(fieldId) {
        const editor = this.editors[fieldId];
        if (!editor) {
            console.warn(`Éditeur ${fieldId} non trouvé`);
            return '';
        }
        return editor.root.innerHTML || '';
    }
}

// Initialiser le gestionnaire Quill uniquement une fois que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.quillManager = new QuillManager();
    window.quillManager.init();
});