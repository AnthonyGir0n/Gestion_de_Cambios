// Configuración global del Worker de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// === LÓGICA DE CARGA (LOADER) ===
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const appContainer = document.getElementById('appContainer');
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => appContainer.classList.add('loaded'), 300);
    }, 1500); 
});

// === LÓGICA DEL FORMULARIO ===
let currentStep = 1;
const totalSteps = 5;

document.addEventListener('DOMContentLoaded', () => {
    const dateObj = new Date();
    const id = 'RFC-UMG-' + dateObj.getTime().toString().slice(-6);
    document.getElementById('idDisplay').innerText = `ID: ${id}`;
    document.getElementById('printDate').innerText = dateObj.toLocaleDateString('es-GT');
});

function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) return;

    const currentPane = document.getElementById(`step-${currentStep}`);
    const currentInd = document.getElementById(`ind-${currentStep}`);
    
    currentPane.style.opacity = '0';
    currentPane.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        currentPane.classList.remove('active');
        currentInd.classList.remove('active');
        if(direction === 1) currentInd.classList.add('completed');

        currentStep += direction;

        const nextPane = document.getElementById(`step-${currentStep}`);
        const nextInd = document.getElementById(`ind-${currentStep}`);
        
        nextPane.classList.add('active');
        nextInd.classList.add('active');

        document.getElementById('btnPrev').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        if (currentStep === totalSteps) {
            document.getElementById('btnNext').style.display = 'none';
            document.getElementById('btnSubmit').style.display = 'flex';
        } else {
            document.getElementById('btnNext').style.display = 'flex';
            document.getElementById('btnSubmit').style.display = 'none';
        }
    }, 300); 
}

function validateCurrentStep() {
    const stepPane = document.getElementById(`step-${currentStep}`);
    const inputs = stepPane.querySelectorAll('input[required], select[required], textarea[required]');
    for (let input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity();
            
            if (input.type === 'file') {
                input.parentElement.style.borderColor = '#e74c3c';
                setTimeout(() => input.parentElement.style.borderColor = '', 2000);
            } else {
                input.style.borderColor = '#e74c3c';
                setTimeout(() => input.style.borderColor = '', 2000);
            }
            return false;
        }
    }
    return true;
}

function calcularRiesgo() {
    const impacto = parseInt(document.getElementById('impacto').value);
    const urgencia = parseInt(document.getElementById('urgencia').value);
    const score = impacto + urgencia;
    const badge = document.getElementById('riskBadge');
    badge.className = 'risk-badge'; 

    if (score <= 3) {
        badge.classList.add('risk-low');
        badge.innerText = `Nivel de Riesgo: BAJO (Puntuación: ${score})`;
    } else if (score === 4) {
        badge.classList.add('risk-medium');
        badge.innerText = `Nivel de Riesgo: MEDIO (Puntuación: ${score})`;
    } else {
        badge.classList.add('risk-high');
        badge.innerText = `Nivel de Riesgo: ALTO/CRÍTICO (Puntuación: ${score})`;
    }
}

// === LECTURA Y PREVISUALIZACIÓN DE IMÁGENES Y PDFS ===
const fileInputs = document.querySelectorAll('.file-input');
fileInputs.forEach(input => {
    input.addEventListener('dragenter', () => input.parentElement.classList.add('is-active'));
    input.addEventListener('dragleave', () => input.parentElement.classList.remove('is-active'));
    input.addEventListener('drop', () => input.parentElement.classList.remove('is-active'));
    
    input.addEventListener('change', function() {
        const msgSpan = this.previousElementSibling;
        const previewContainer = this.parentElement.nextElementSibling;
        
        previewContainer.innerHTML = ''; 

        if (this.files && this.files.length > 0) {
            msgSpan.innerText = `✅ ${this.files.length} documento(s) cargado(s)`;
            msgSpan.style.color = '#002b5c';
            
            Array.from(this.files).forEach(file => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                // Si es IMAGEN, se muestra directamente
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewItem.innerHTML = `
                            <div class="file-name">Evidencia: ${file.name}</div>
                            <img src="${e.target.result}" alt="${file.name}">
                        `;
                    };
                    reader.readAsDataURL(file);
                    previewContainer.appendChild(previewItem);
                } 
                // Si es PDF, usamos PDF.js para renderizar la primera página como imagen
                else if (file.type === 'application/pdf') {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const typedarray = new Uint8Array(e.target.result);
                        
                        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                            pdf.getPage(1).then(page => {
                                const viewport = page.getViewport({scale: 1.5});
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                const renderContext = { canvasContext: context, viewport: viewport };
                                
                                page.render(renderContext).promise.then(() => {
                                    previewItem.innerHTML = `<div class="file-name">Documento PDF: ${file.name}</div>`;
                                    previewItem.appendChild(canvas);
                                    previewContainer.appendChild(previewItem);
                                });
                            });
                        }).catch(err => {
                            console.error("Error leyendo PDF", err);
                            previewItem.innerHTML = `<div class="file-name">${file.name} (Error al cargar vista previa)</div>`;
                            previewContainer.appendChild(previewItem);
                        });
                    };
                    reader.readAsArrayBuffer(file);
                }
            });
            
        } else {
            msgSpan.innerText = 'Arrastra y suelta tus imágenes o PDFs aquí';
            msgSpan.style.color = 'var(--text-main)';
        }
    });
});

document.getElementById('rfcForm').addEventListener('submit', function(e) {
    e.preventDefault();
    window.print();
});
