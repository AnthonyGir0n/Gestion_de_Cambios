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

// === INTERACTIVIDAD Y PREVISUALIZACIÓN DE ARCHIVOS ===
const fileInputs = document.querySelectorAll('.file-input');
fileInputs.forEach(input => {
    input.addEventListener('dragenter', () => input.parentElement.classList.add('is-active'));
    input.addEventListener('dragleave', () => input.parentElement.classList.remove('is-active'));
    input.addEventListener('drop', () => input.parentElement.classList.remove('is-active'));
    
    input.addEventListener('change', function() {
        const msgSpan = this.previousElementSibling;
        const previewContainer = this.parentElement.nextElementSibling;
        
        // Limpiar previsualizaciones anteriores
        previewContainer.innerHTML = ''; 

        if (this.files && this.files.length > 0) {
            msgSpan.innerText = `✅ ${this.files.length} archivo(s) listo(s)`;
            msgSpan.style.color = '#002b5c';
            
            // Generar previsualización por cada archivo
            Array.from(this.files).forEach(file => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                // Si es imagen, muestra miniatura
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewItem.innerHTML = `
                            <img src="${e.target.result}" alt="${file.name}">
                            <div class="file-name">${file.name}</div>
                        `;
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Si es documento (PDF, Word, etc.), muestra un ícono
                    let icon = '📄';
                    if (file.type === 'application/pdf') icon = '📕';
                    else if (file.type.includes('word') || file.name.endsWith('.docx')) icon = '📘';
                    else if (file.type.includes('zip') || file.name.endsWith('.rar')) icon = '📦';

                    previewItem.innerHTML = `
                        <div class="file-icon">${icon}</div>
                        <div class="file-name">${file.name}</div>
                    `;
                }
                previewContainer.appendChild(previewItem);
            });
            
        } else {
            msgSpan.innerText = 'Arrastra y suelta tus archivos aquí o haz clic para subir';
            msgSpan.style.color = 'var(--text-main)';
        }
    });
});

document.getElementById('rfcForm').addEventListener('submit', function(e) {
    e.preventDefault();
    window.print();
});
