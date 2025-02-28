document.addEventListener('DOMContentLoaded', function() {
    const logoInput = document.getElementById('logoFile');
    
    logoInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const response = await fetch('/api/upload-logo', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                // Rafraîchir l'image du logo
                const logoImg = document.querySelector('.org-logo');
                if (logoImg) {
                    logoImg.src = data.logoUrl;
                } else {
                    // Si l'image n'existe pas encore, la créer
                    const logoCell = document.querySelector('.logo-cell');
                    const newImg = document.createElement('img');
                    newImg.src = data.logoUrl;
                    newImg.alt = 'Logo organisation';
                    newImg.className = 'org-logo';
                    newImg.style.maxWidth = '100px';
                    newImg.style.height = 'auto';
                    logoCell.insertBefore(newImg, logoCell.firstChild);
                }
            } else {
                alert('Erreur lors de l\'upload : ' + data.error);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'upload du logo');
        }
    });
});