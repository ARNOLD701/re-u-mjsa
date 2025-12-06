document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('receiptForm');
            const generateBtn = document.getElementById('generateBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const previewDownloadBtn = document.getElementById('previewDownloadBtn');
            const photoUpload = document.getElementById('photoUpload');
            const previewImage = document.getElementById('previewImage');
            const photoPlaceholder = document.getElementById('photoPlaceholder');
            const situationMouvementInput = document.getElementById('situationMouvement');
            const montantPrevuInput = document.getElementById('montantPrevu');
            const montantVerseInput = document.getElementById('montantVerse');
            const montantRestantInput = document.getElementById('montantRestant');
            
            // Définir les montants selon la situation
            const montantsParSituation = {
                'Nouveau': 4000,
                'Ancien': 3500,
                'Responsable': 1000
            };
            
            // Mettre à jour le montant prévu selon la situation
            function mettreAJourMontantPrevu() {
                const situation = situationMouvementInput.value;
                
                if (situation && montantsParSituation[situation]) {
                    const montant = montantsParSituation[situation];
                    montantPrevuInput.value = montant.toLocaleString('fr-FR') + " FCFA";
                    calculerMontantRestant();
                } else {
                    montantPrevuInput.value = "";
                    montantRestantInput.value = "";
                }
            }
            
            // Calculer automatiquement le montant restant
            function calculerMontantRestant() {
                const situation = situationMouvementInput.value;
                const montantVerse = parseFloat(montantVerseInput.value) || 0;
                
                if (situation && montantsParSituation[situation]) {
                    const montantPrevu = montantsParSituation[situation];
                    
                    // Vérifier que le montant versé ne dépasse pas le montant prévu
                    if (montantVerse > montantPrevu) {
                        montantRestantInput.value = "Erreur: Montant versé > Montant prévu";
                        montantRestantInput.style.color = "#d9534f";
                        generateBtn.disabled = true;
                    } else {
                        const montantRestant = montantPrevu - montantVerse;
                        montantRestantInput.value = montantRestant.toLocaleString('fr-FR') + " FCFA";
                        montantRestantInput.style.color = "#000";
                        generateBtn.disabled = false;
                    }
                } else {
                    montantRestantInput.value = "";
                    generateBtn.disabled = true;
                }
            }
            
            // Écouter les changements sur la situation
            situationMouvementInput.addEventListener('change', mettreAJourMontantPrevu);
            
            // Écouter les changements sur le montant versé
            montantVerseInput.addEventListener('input', calculerMontantRestant);
            
            // Mettre à jour l'aperçu en temps réel
            form.addEventListener('input', updatePreview);
            
            // Gérer l'upload de photo
            photoUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        previewImage.src = event.target.result;
                        previewImage.classList.remove('hidden');
                        photoPlaceholder.classList.add('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Générer le reçu
            generateBtn.addEventListener('click', function() {
                updatePreview();
                downloadBtn.classList.remove('hidden');
                previewDownloadBtn.classList.remove('hidden');
            });
            
            // Télécharger le PDF
            downloadBtn.addEventListener('click', generatePDF);
            previewDownloadBtn.addEventListener('click', generatePDF);
            
            function updatePreview() {
                // Récupérer les valeurs du formulaire
                const civilite = document.getElementById('civilite').value;
                const nomPrenom = document.getElementById('nomPrenom').value;
                const categorie = document.getElementById('categorie').value;
                const montantPrevu = montantPrevuInput.value;
                const montantVerse = document.getElementById('montantVerse').value;
                const montantRestant = montantRestantInput.value;
                const identifiant = document.getElementById('identifiant').value;
                const dateFait = document.getElementById('dateFait').value;
                
                // Mettre à jour l'aperçu
                document.getElementById('previewNomPrenom').textContent = 
                    civilite + ' ' + nomPrenom;
                document.getElementById('previewCategorie').textContent = categorie;
                document.getElementById('previewMontantPrevu').textContent = 
                    montantPrevu || '(montant total prévu en FCFA)';
                document.getElementById('previewMontantVerse').textContent = 
                    montantVerse ? parseInt(montantVerse).toLocaleString('fr-FR') + ' FCFA' : '(comme écrite avec pour monnaie FCFA)';
                document.getElementById('previewMontantRestant').textContent = 
                    montantRestant && !montantRestant.includes("Erreur") ? montantRestant : '(le restant de la somme indiqué-la somme écrite avec pour monnaie FCFA)';
                document.getElementById('previewIdentifiant').textContent = 
                    identifiant || '(numéro de passage indiquée)';
                
                // Formater la date
                if (dateFait) {
                    const dateObj = new Date(dateFait);
                    const formattedDate = dateObj.toLocaleDateString('fr-FR');
                    document.getElementById('previewDate').textContent = formattedDate;
                } else {
                    document.getElementById('previewDate').textContent = '(date du jour)';
                }
            }
            
            function generatePDF() {
                const { jsPDF } = window.jspdf;
                const receiptElement = document.getElementById('receiptPreview');
                
                html2canvas(receiptElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210; // A4 width in mm
                    const pageHeight = 295; // A4 height in mm
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;
                    
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    
                    pdf.save('recu_mjsa_2025-2026.pdf');
                });
            }
            
            // Initialiser la date du jour
            const today = new Date();
            const formattedToday = today.toISOString().split('T')[0];
            document.getElementById('dateFait').value = formattedToday;
            updatePreview();
        });