// Configuración global del Worker de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const appContainer = document.getElementById('appContainer');
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => appContainer.classList.add('loaded'), 300);
    }, 1500); 
});

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

// === LECTURA AVANZADA DE DOCUMENTOS (MULTIPÁGINA Y ORDENADO) ===
const fileInputs = document.querySelectorAll('.file-input');
fileInputs.forEach(input => {
    input.addEventListener('dragenter', () => input.parentElement.classList.add('is-active'));
    input.addEventListener('dragleave', () => input.parentElement.classList.remove('is-active'));
    input.addEventListener('drop', () => input.parentElement.classList.remove('is-active'));
    
    // Usamos función asíncrona para garantizar el orden de las páginas
    input.addEventListener('change', async function() {
        const msgSpan = this.previousElementSibling;
        const previewContainer = this.parentElement.nextElementSibling;
        
        previewContainer.innerHTML = ''; // Limpiar previsualizaciones anteriores

        if (this.files && this.files.length > 0) {
            msgSpan.innerText = `⏳ Procesando ${this.files.length} documento(s)...`;
            msgSpan.style.color = '#e74c3c';
            
            // Iterar sobre todos los archivos seleccionados
            for (let file of Array.from(this.files)) {
                
                // Crear un envoltorio principal para cada documento
                const docWrapper = document.createElement('div');
                docWrapper.className = 'document-wrapper';
                previewContainer.appendChild(docWrapper);
                
                // Si es IMAGEN
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        docWrapper.innerHTML = `
                            <div class="doc-title">🖼️ Imagen Adjunta: ${file.name}</div>
                            <div class="preview-item">
                                <div class="file-name">Evidencia Fotográfica</div>
                                <img src="${e.target.result}" alt="${file.name}">
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                } 
                // Si es PDF (Procesamiento Multipágina)
                else if (file.type === 'application/pdf') {
                    const reader = new FileReader();
                    
                    // Envolvemos el onload en una promesa para pausar el bucle si es necesario
                    await new Promise(resolve => {
                        reader.onload = async function(e) {
                            try {
                                const typedarray = new Uint8Array(e.target.result);
                                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                                
                                docWrapper.innerHTML = `<div class="doc-title">📕 Documento PDF: ${file.name} (${pdf.numPages} páginas)</div>`;
                                
                                const pagesContainer = document.createElement('div');
                                pagesContainer.className = 'pdf-pages-container';
                                docWrapper.appendChild(pagesContainer);
                                
                                // Bucle FOR asíncrono para garantizar que la Pag 1 renderice antes que la Pag 2
                                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                                    const page = await pdf.getPage(pageNum);
                                    const viewport = page.getViewport({scale: 1.5}); // Escala óptima para impresión
                                    
                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    canvas.height = viewport.height;
                                    canvas.width = viewport.width;

                                    // Renderizar la página actual
                                    await page.render({canvasContext: context, viewport: viewport}).promise;
                                    
                                    const previewItem = document.createElement('div');
                                    previewItem.className = 'preview-item';
                                    previewItem.innerHTML = `<div class="file-name">Página ${pageNum} de ${pdf.numPages}</div>`;
                                    previewItem.appendChild(canvas);
                                    
                                    pagesContainer.appendChild(previewItem);
                                }
                                resolve(); // Termina este PDF
                            } catch (err) {
                                console.error("Error leyendo PDF", err);
                                docWrapper.innerHTML = `<div class="doc-title">❌ Error procesando PDF: ${file.name}</div>`;
                                resolve();
                            }
                        };
                        reader.readAsArrayBuffer(file);
                    });
                }
            }
            
            msgSpan.innerText = `✅ ${this.files.length} documento(s) listo(s) para imprimir`;
            msgSpan.style.color = '#002b5c';
            
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
