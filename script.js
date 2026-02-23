// === LÓGICA DE CARGA (LOADER) ===
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const appContainer = document.getElementById('appContainer');
        
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        
        setTimeout(() => {
            appContainer.classList.add('loaded');
        }, 300);
        
    }, 1500); 
});

// === LÓGICA DEL FORMULARIO ===
let currentStep = 1;
const totalSteps = 5; // <--- Cambiado a 5 pasos

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
            
            // Animación de borde rojo para archivos o inputs normales
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

// === INTERACTIVIDAD DE SUBIDA DE ARCHIVOS ===
const fileInputs = document.querySelectorAll('.file-input');
fileInputs.forEach(input => {
    // Cuando el mouse entra (Drag & Drop visual)
    input.addEventListener('dragenter', () => input.parentElement.classList.add('is-active'));
    input.addEventListener('dragleave', () => input.parentElement.classList.remove('is-active'));
    input.addEventListener('drop', () => input.parentElement.classList.remove('is-active'));
    
    // Cuando se selecciona un archivo
    input.addEventListener('change', function() {
        const msgSpan = this.previousElementSibling;
        if (this.files && this.files.length > 1) {
            msgSpan.innerText = `✅ ${this.files.length} archivos seleccionados`;
            msgSpan.style.color = '#002b5c';
        } else if (this.files && this.files.length === 1) {
            msgSpan.innerText = `✅ Archivo cargado: ${this.files[0].name}`;
            msgSpan.style.color = '#002b5c';
        } else {
            msgSpan.innerText = 'Arrastra y suelta tus archivos aquí o haz clic para subir';
        }
    });
});

document.getElementById('rfcForm').addEventListener('submit', function(e) {
    e.preventDefault();
    window.print();
});
