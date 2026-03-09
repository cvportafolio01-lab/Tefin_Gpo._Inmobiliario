document.addEventListener("DOMContentLoaded", ()=>{

document.querySelectorAll('.counter').forEach(counter=>{
    const update=()=>{
        let target=+counter.dataset.target;
        let c=+counter.innerText;
        let inc=target/120;

        if(c<target){
            counter.innerText=Math.ceil(c+inc);
            setTimeout(update,20);
        }else{
            counter.innerText=target;
        }
    };
    update();
});

});
  

/*propiedades*/
let propiedadesData = [];

async function cargarPropiedades() {
    try {
        const response = await fetch('propiedades.json');
        const data = await response.json();
        propiedadesData = data.propiedades;
        return propiedadesData;
    } catch (error) {
        console.error('Error al cargar propiedades:', error);
        return [];
    }
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    }).format(precio);
}

function crearTarjetaPropiedad(propiedad) {
    const estadoBadge = propiedad.estado === 'venta' 
        ? '<span class="badge bg-success badge-custom">En Venta</span>'
        : '<span class="badge bg-info badge-custom">En Renta</span>';
    
    const caracteristicas = propiedad.caracteristicas
        .slice(0, 2)
        .map(c => `<span class="badge bg-secondary">${c}</span>`)
        .join(' ');

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card property-card shadow-sm h-100">
                <div class="position-relative">
                    <img src="${propiedad.imagen}" class="card-img-top property-img" alt="${propiedad.titulo}">
                    <div class="position-absolute top-0 end-0 m-3">
                        ${estadoBadge}
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${propiedad.titulo}</h5>
                    <p class="text-muted mb-2">
                        <i class="bi bi-geo-alt-fill"></i> ${propiedad.ubicacion}
                    </p>
                    <p class="card-text text-muted small">${propiedad.descripcion}</p>
                    <div class="property-features mb-3">
                        <span><i class="bi bi-door-closed"></i> ${propiedad.habitaciones}</span>
                        <span><i class="bi bi-droplet"></i> ${propiedad.banos}</span>
                        <span><i class="bi bi-arrows-angle-expand"></i> ${propiedad.area}m²</span>
                    </div>
                    <div class="mb-3">
                        ${caracteristicas}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price-tag">${formatearPrecio(propiedad.precio)}</span>
                        <button class="btn btn-outline-primary" onclick="verDetalle(${propiedad.id})">
                            Ver más
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function verDetalle(id) {
    const propiedad = propiedadesData.find(p => p.id === id);
    if (propiedad) {
        const caracteristicasLista = propiedad.caracteristicas
            .map(c => `<li>${c}</li>`)
            .join('');
        
        const modal = `
            <div class="modal fade" id="modalPropiedad" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${propiedad.titulo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <img src="${propiedad.imagen}" class="img-fluid rounded mb-3" alt="${propiedad.titulo}">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <h6><i class="bi bi-geo-alt-fill text-primary"></i> Ubicación</h6>
                                    <p>${propiedad.ubicacion}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="bi bi-tag-fill text-primary"></i> Precio</h6>
                                    <p class="fs-4 text-primary fw-bold">${formatearPrecio(propiedad.precio)}</p>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-4">
                                    <i class="bi bi-door-closed"></i> <strong>${propiedad.habitaciones}</strong> Habitaciones
                                </div>
                                <div class="col-4">
                                    <i class="bi bi-droplet"></i> <strong>${propiedad.banos}</strong> Baños
                                </div>
                                <div class="col-4">
                                    <i class="bi bi-arrows-angle-expand"></i> <strong>${propiedad.area}m²</strong>
                                </div>
                            </div>
                            <h6>Descripción</h6>
                            <p>${propiedad.descripcion}</p>
                            <h6>Características</h6>
                            <ul>${caracteristicasLista}</ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <a href="contacto.html" class="btn btn-primary">Contactar</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('modalPropiedad');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const bsModal = new bootstrap.Modal(document.getElementById('modalPropiedad'));
        bsModal.show();
    }
}

async function mostrarPropiedadesDestacadas() {
    const container = document.getElementById('featured-properties');
    if (!container) return;
    
    const propiedades = await cargarPropiedades();
    const destacadas = propiedades.filter(p => p.destacada).slice(0, 3);
    
    if (destacadas.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hay propiedades destacadas disponibles</p></div>';
        return;
    }
    
    container.innerHTML = destacadas.map(propiedad => crearTarjetaPropiedad(propiedad)).join('');
}

async function mostrarTodasLasPropiedades(filtro = 'todas') {
    const container = document.getElementById('properties-container');
    if (!container) return;
    
    const propiedades = await cargarPropiedades();
    let propiedadesFiltradas = propiedades;
    
    if (filtro === 'venta') {
        propiedadesFiltradas = propiedades.filter(p => p.estado === 'venta');
    } else if (filtro === 'renta') {
        propiedadesFiltradas = propiedades.filter(p => p.estado === 'renta');
    } else if (filtro === 'casas') {
        propiedadesFiltradas = propiedades.filter(p => p.tipo === 'Casa');
    } else if (filtro === 'departamentos') {
        propiedadesFiltradas = propiedades.filter(p => p.tipo === 'Departamento');
    }
    
    if (propiedadesFiltradas.length === 0) {
        container.innerHTML = `
            <div class="col-12 empty-state">
                <i class="bi bi-house-x"></i>
                <h4>No se encontraron propiedades</h4>
                <p>Intenta con otro filtro</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = propiedadesFiltradas.map(propiedad => crearTarjetaPropiedad(propiedad)).join('');
}

function aplicarFiltro(filtro) {
    const botones = document.querySelectorAll('.btn-filter');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    mostrarTodasLasPropiedades(filtro);
}

function buscarPropiedades() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('properties-container');
    
    if (!searchTerm) {
        mostrarTodasLasPropiedades();
        return;
    }
    
    const propiedadesFiltradas = propiedadesData.filter(p => 
        p.titulo.toLowerCase().includes(searchTerm) ||
        p.ubicacion.toLowerCase().includes(searchTerm) ||
        p.descripcion.toLowerCase().includes(searchTerm)
    );
    
    if (propiedadesFiltradas.length === 0) {
        container.innerHTML = `
            <div class="col-12 empty-state">
                <i class="bi bi-search"></i>
                <h4>No se encontraron resultados</h4>
                <p>Intenta con otra búsqueda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = propiedadesFiltradas.map(propiedad => crearTarjetaPropiedad(propiedad)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featured-properties')) {
        mostrarPropiedadesDestacadas();
    }
    
    if (document.getElementById('properties-container')) {
        mostrarTodasLasPropiedades();
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                buscarPropiedades();
            }
        });
    }
});

