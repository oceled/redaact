class NotificationManager {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        if (!document.getElementById('notificationModal')) {
            const modalHTML = `
                <div class="modal fade" id="notificationModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content card bg-primary shadow-soft border-light">
                            <div class="modal-header border-0">
                                <h5 class="modal-title" id="notificationTitle"></h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div id="notificationIcon" class="mb-3"></div>
                                <p id="notificationMessage" class="mb-0"></p>
                            </div>
                            <div class="modal-footer border-0 justify-content-center">
                                <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = modalHTML;
            document.body.appendChild(tempDiv.firstElementChild);
        }

        const modalElement = document.getElementById('notificationModal');
        if (modalElement) {
            this.modal = new bootstrap.Modal(modalElement);
        }
    }

    show(options = {}) {
        const {
            title = 'Notification',
            message = '',
            type = 'success',
            showVersionChoice = false,
            onConfirm = null
        } = options;

        if (!this.modal) {
            this.init();
        }

        const titleElement = document.getElementById('notificationTitle');
        const messageElement = document.getElementById('notificationMessage');
        const iconElement = document.getElementById('notificationIcon');

        if (titleElement && messageElement && iconElement) {
            titleElement.textContent = title;

            if (showVersionChoice) {
                messageElement.innerHTML = `
                    ${message}
                    <div class="mt-3">
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="versionType" id="correctionVersion" value="correction" checked>
                            <label class="form-check-label" for="correctionVersion">
                                Correction de la procédure existante
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="versionType" id="newVersion" value="new">
                            <label class="form-check-label" for="newVersion">
                                Nouvelle version (changement de processus)
                            </label>
                        </div>
                    </div>
                `;

                const okButton = document.querySelector('#notificationModal button[data-bs-dismiss="modal"]');
                okButton.onclick = () => {
                    const selectedType = document.querySelector('input[name="versionType"]:checked').value;
                    if (onConfirm) {
                        onConfirm(selectedType);
                    }
                };
            } else {
                messageElement.textContent = message;
            }
            
            const icons = {
                success: '<i class="fas fa-check-circle fa-3x text-success"></i>',
                error: '<i class="fas fa-times-circle fa-3x text-danger"></i>',
                warning: '<i class="fas fa-exclamation-triangle fa-3x text-warning"></i>',
                info: '<i class="fas fa-info-circle fa-3x text-info"></i>'
            };
            
            iconElement.innerHTML = icons[type] || icons.info;

            this.modal.show();

            if (type === 'success' && !showVersionChoice) {
                setTimeout(() => {
                    this.modal.hide();
                }, 2000);
            }
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});