if (!window.ModalHandler) {
    class ModalHandler {
        constructor() {
            this.initializeModal();
        }

        initializeModal() {
            const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
            document.querySelector('[data-bs-target="#infoModal"]').addEventListener('click', (e) => {
                e.preventDefault();
                infoModal.show();
            });
        }
    }

    window.ModalHandler = ModalHandler;
}