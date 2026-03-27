/**
 * prototipo-delivery/script.js
 * Restaurantes → platos → resumen → confirmación. Sin módulos ES6.
 * Versión mejorada con correcciones de UI/UX
 */

(function () {
  'use strict';

  var RESTAURANTES = [
    { id: 'r1', nombre: 'Pizzería Napoli', categoria: 'pizza', img: './assets/rest-r1.svg' },
    { id: 'r2', nombre: 'Sushi Roll', categoria: 'asiatica', img: './assets/rest-r2.svg' },
    { id: 'r3', nombre: 'Burger Norte', categoria: 'hamburguesas', img: './assets/rest-r3.svg' },
    { id: 'r4', nombre: 'Mamma Mia Express', categoria: 'pizza', img: './assets/rest-r4.svg' }
  ];

  /** Platos por restaurante (cada uno con imagen en ./assets/) */
  var MENU = {
    r1: [
      { id: 'm1', nombre: 'Margarita', precio: 8.5, img: './assets/dish-m1.svg' },
      { id: 'm2', nombre: 'Cuatro quesos', precio: 10.9, img: './assets/dish-m2.svg' }
    ],
    r2: [
      { id: 'm3', nombre: 'Menú maki (12 pzs)', precio: 14.0, img: './assets/dish-m3.svg' },
      { id: 'm4', nombre: 'Yakisoba', precio: 9.5, img: './assets/dish-m4.svg' }
    ],
    r3: [
      { id: 'm5', nombre: 'Clásica + patatas', precio: 11.0, img: './assets/dish-m5.svg' },
      { id: 'm6', nombre: 'Veggie', precio: 10.5, img: './assets/dish-m6.svg' }
    ],
    r4: [
      { id: 'm7', nombre: 'Calzone', precio: 9.0, img: './assets/dish-m7.svg' },
      { id: 'm8', nombre: 'Prosciutto', precio: 11.5, img: './assets/dish-m8.svg' }
    ]
  };

  var restauranteActual = null;
  /** pedido: { idPlato, nombre, precioUnit, cantidad, img } */
  var pedido = [];

  var elFiltro = document.getElementById('filtro-cat');
  var elListaRest = document.getElementById('lista-restaurantes');
  var elStepRest = document.getElementById('step-restaurante');
  var elStepProd = document.getElementById('step-productos');
  var elStepRes = document.getElementById('step-resumen');
  var elStepConf = document.getElementById('step-confirmacion');
  var elTituloRest = document.getElementById('titulo-restaurante');
  var elListaPlatos = document.getElementById('lista-platos');
  var elListaResumen = document.getElementById('lista-resumen');
  var elResumenVacio = document.getElementById('resumen-vacio');
  var elTotal = document.getElementById('total-delivery');
  var elMsgConfirm = document.getElementById('msg-confirm');
  var elBtnCarrito = document.getElementById('btn-carrito');
  var elCarritoBadge = document.getElementById('carrito-badge');
  var elToast = document.getElementById('toast');

  /** Mapeo de categorías para mostrar capitalizadas */
  var categoriasMap = {
    pizza: 'Pizza',
    asiatica: 'Asiática',
    hamburguesas: 'Hamburguesas'
  };

  function mostrarSoloPanel(panel) {
    var panels = [elStepRest, elStepProd, elStepRes, elStepConf];
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var on = p === panel;
      p.classList.toggle('active', on);
      p.hidden = !on;
    }
    actualizarIndicadoresPasos(panel);
    
    // Mover foco al heading del panel para accesibilidad WCAG 2.4.3
    var heading = panel.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  function actualizarIndicadoresPasos(panel) {
    var n = '0';
    if (panel === elStepRest) n = '1';
    if (panel === elStepProd) n = '2';
    if (panel === elStepRes) n = '3';
    if (panel === elStepConf) n = '3';

    var indicadores = document.querySelectorAll('[data-step-indicator]');
    for (var i = 0; i < indicadores.length; i++) {
      var el = indicadores[i];
      var step = el.getAttribute('data-step-indicator');
      el.classList.toggle('active', step === n || (panel === elStepConf && step === '3'));
    }
  }

  function getCategoriaMostrar(cat) {
    return categoriasMap[cat] || cat;
  }

  function filtrarRestaurantes() {
    var cat = elFiltro.value;
    elListaRest.innerHTML = '';
    var hayResultados = false;
    for (var i = 0; i < RESTAURANTES.length; i++) {
      var r = RESTAURANTES[i];
      if (cat !== 'todas' && r.categoria !== cat) continue;
      hayResultados = true;
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-rest';
      btn.setAttribute('data-rest', r.id);
      btn.setAttribute('aria-label', 'Seleccionar ' + r.nombre);
      btn.innerHTML =
        '<span class="card-rest__media"><img src="' +
        escapeHtml(r.img) +
        '" width="72" height="72" alt="" loading="lazy"></span>' +
        '<span class="card-rest__body"><strong>' +
        escapeHtml(r.nombre) +
        '</strong><span class="tag">' +
        getCategoriaMostrar(r.categoria) +
        '</span></span>';
      li.appendChild(btn);
      elListaRest.appendChild(li);
    }
    if (!hayResultados) {
      elListaRest.innerHTML = '<li class="muted">No hay restaurantes de esta categoría.</li>';
    }
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  function getCantidadPlato(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) return pedido[i].cantidad;
    }
    return 0;
  }

  function abrirMenu(restId) {
    // Si ya hay items en el pedido y es un restaurante diferente, warning
    var restauranteAnterior = restauranteActual;
    
    if (pedido.length > 0 && restauranteAnterior && restauranteAnterior !== restId) {
      if (!confirm('Tiene items de otro restaurante. ¿Quiere empezar un nuevo pedido?')) {
        return;
      }
      // Si el usuario confirma, limpiamos el pedido
      pedido = [];
    }
    
    restauranteActual = restId;
    var r = null;
    for (var i = 0; i < RESTAURANTES.length; i++) {
      if (RESTAURANTES[i].id === restId) {
        r = RESTAURANTES[i];
        break;
      }
    }
    elTituloRest.textContent = r ? r.nombre : 'Menú';
    var platos = MENU[restId] || [];
    elListaPlatos.innerHTML = '';
    
    // Mostrar mensaje si no hay platos
    if (platos.length === 0) {
      elListaPlatos.innerHTML = '<li class="muted" style="padding: 1rem; text-align: center;">No hay platos disponibles en este momento.</li>';
    }
    
    for (var j = 0; j < platos.length; j++) {
      var pl = platos[j];
      var cantidad = getCantidadPlato(pl.id);
      var li = document.createElement('li');
      li.className = 'plato-row';
      var cantidadBadge = cantidad > 0 ? '<span class="cantidad-badge">' + cantidad + '</span>' : '';
      li.innerHTML =
        '<img class="plato-thumb" src="' +
        escapeHtml(pl.img) +
        '" width="52" height="52" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="plato-info"><span class="plato-nombre">' +
        escapeHtml(pl.nombre) +
        cantidadBadge +
        '</span></div>' +
        '<span class="plato-precio">' +
        formatEuros(pl.precio) +
        '</span>' +
        '<button type="button" class="btn-mini" data-add-plato="' +
        escapeAttr(pl.id) +
        '" data-nombre="' +
        escapeAttr(pl.nombre) +
        '" data-precio="' +
        pl.precio +
        '" data-img="' +
        escapeAttr(pl.img) +
        '" aria-label="Añadir ' + escapeAttr(pl.nombre) + '">' +
        (cantidad > 0 ? '+' : '+') +
        '</button>';
      elListaPlatos.appendChild(li);
    }
    mostrarSoloPanel(elStepProd);
    actualizarBadgeCarrito();
  }

  function lineaPedido(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) return pedido[i];
    }
    return null;
  }

  function agregarPlato(idPlato, nombre, precio, img) {
    // Validar que precio sea número positivo
    if (typeof precio !== 'number' || precio < 0) {
      showToast('Error: precio inválido');
      return;
    }
    var linea = lineaPedido(idPlato);
    if (linea) {
      linea.cantidad += 1;
    } else {
      pedido.push({
        idPlato: idPlato,
        nombre: nombre,
        precioUnit: precio,
        cantidad: 1,
        img: img
      });
    }
    showToast(nombre + ' añadido');
    actualizarBadgeCarrito();
    // Si estamos en el panel de productos, actualizar la vista
    if (!elStepProd.hidden) {
      abrirMenu(restauranteActual);
    }
  }

  function modificarCantidad(idPlato, cambio) {
    var linea = lineaPedido(idPlato);
    if (!linea) return;
    
    linea.cantidad += cambio;
    
    if (linea.cantidad <= 0) {
      // Eliminar el plato del pedido
      pedido = pedido.filter(function (p) {
        return p.idPlato !== idPlato;
      });
      showToast(linea.nombre + ' eliminado');
    } else {
      showToast(linea.nombre + ': ' + linea.cantidad + ' unidades');
    }
    
    actualizarBadgeCarrito();
    pintarResumen();
    
    // Si estamos en el panel de productos, actualizar la vista
    if (!elStepProd.hidden) {
      abrirMenu(restauranteActual);
    }
  }

  function totalPedido() {
    var t = 0;
    for (var i = 0; i < pedido.length; i++) {
      var cantidad = pedido[i].cantidad;
      var precio = pedido[i].precioUnit;
      if (typeof cantidad === 'number' && typeof precio === 'number') {
        t += precio * cantidad;
      }
    }
    return t;
  }

  function formatEuros(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0,00 €';
    return Number(n).toFixed(2).replace('.', ',') + ' €';
  }

  function actualizarBadgeCarrito() {
    var totalItems = 0;
    for (var i = 0; i < pedido.length; i++) {
      totalItems += pedido[i].cantidad;
    }
    elCarritoBadge.textContent = totalItems;
    elCarritoBadge.hidden = totalItems === 0;
    
    // Actualizar texto del botón sticky
    var btnText = elBtnCarrito.querySelector('.carrito-text');
    var btnCount = elBtnCarrito.querySelector('.carrito-count');
    if (btnText) {
      btnText.textContent = totalItems > 0 ? 'Ver pedido (' + totalItems + ')' : 'Ver pedido';
    }
    if (btnCount) {
      btnCount.textContent = totalItems;
      btnCount.hidden = totalItems === 0;
    }
  }

  function showToast(mensaje) {
    elToast.textContent = mensaje;
    elToast.hidden = false;
    elToast.classList.remove('toast-out');
    elToast.style.animation = 'none';
    // Force reflow
    elToast.offsetHeight;
    elToast.style.animation = '';
    
    // Ocultar después de 2 segundos
    setTimeout(function () {
      elToast.classList.add('toast-out');
      setTimeout(function () {
        elToast.hidden = true;
      }, 300);
    }, 2000);
  }

  function pintarResumen() {
    elListaResumen.innerHTML = '';
    if (pedido.length === 0) {
      elResumenVacio.hidden = false;
      elTotal.textContent = formatEuros(0);
    } else {
      elResumenVacio.hidden = true;
      for (var i = 0; i < pedido.length; i++) {
        var l = pedido[i];
        var li = document.createElement('li');
        li.className = 'resumen-line';
        li.innerHTML =
          '<img class="resumen-thumb" src="' +
          escapeHtml(l.img) +
          '" width="40" height="40" alt="">' +
          '<div class="resumen-info">' +
          '<span class="resumen-nombre">' + escapeHtml(l.nombre) + '</span>' +
          '<span class="resumen-precio">' + formatEuros(l.precioUnit * l.cantidad) + '</span>' +
          '</div>' +
          '<div class="resumen-cantidad">' +
          '<button type="button" class="btn-qty eliminar" data-id="' + escapeAttr(l.idPlato) + '" data-action="remove" aria-label="Eliminar una unidad de ' + escapeAttr(l.nombre) + '">−</button>' +
          '<span class="qty-num">' + l.cantidad + '</span>' +
          '<button type="button" class="btn-qty" data-id="' + escapeAttr(l.idPlato) + '" data-action="add" aria-label="Añadir una unidad de ' + escapeAttr(l.nombre) + '">+</button>' +
          '</div>';
        elListaResumen.appendChild(li);
      }
      elTotal.textContent = formatEuros(totalPedido());
    }
  }

  // Event listener para lista de restaurantes
  elListaRest.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-rest]');
    if (!btn) return;
    abrirMenu(btn.getAttribute('data-rest'));
  });

  // Event listener para filtro
  elFiltro.addEventListener('change', filtrarRestaurantes);

  // Event listener para agregar platos
  elListaPlatos.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-plato]');
    if (!b) return;
    var id = b.getAttribute('data-add-plato');
    var nombre = b.getAttribute('data-nombre');
    var precio = parseFloat(b.getAttribute('data-precio'), 10);
    var imgPlato = b.getAttribute('data-img') || '';
    agregarPlato(id, nombre, precio, imgPlato);
  });

  // Volver a restaurantes
  document.getElementById('btn-volver-rest').addEventListener('click', function () {
    mostrarSoloPanel(elStepRest);
  });

  // Ver carrito/resumen
  elBtnCarrito.addEventListener('click', function () {
    pintarResumen();
    mostrarSoloPanel(elStepRes);
  });

  // Seguir comprando
  document.getElementById('btn-seguir-comprando').addEventListener('click', function () {
    if (restauranteActual) abrirMenu(restauranteActual);
    else mostrarSoloPanel(elStepRest);
  });

  // Confirmar pedido
  document.getElementById('btn-comprar').addEventListener('click', function () {
    if (pedido.length === 0) {
      showToast('Añada al menos un plato antes de confirmar');
      return;
    }
    var nombreRest = '';
    for (var i = 0; i < RESTAURANTES.length; i++) {
      if (RESTAURANTES[i].id === restauranteActual) {
        nombreRest = RESTAURANTES[i].nombre;
        break;
      }
    }
    elMsgConfirm.textContent =
      'Su pedido en ' +
      nombreRest +
      ' por ' +
      formatEuros(totalPedido()) +
      ' está en preparación. Tiempo aproximado: 35 minutos.';
    pedido = [];
    actualizarBadgeCarrito();
    pintarResumen();
    mostrarSoloPanel(elStepConf);
  });

  // Nuevo pedido
  document.getElementById('btn-nuevo').addEventListener('click', function () {
    restauranteActual = null;
    mostrarSoloPanel(elStepRest);
  });

  // Event listener para modificar cantidad en resumen
  elListaResumen.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-id]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var action = btn.getAttribute('data-action');
    if (action === 'add') {
      modificarCantidad(id, 1);
    } else if (action === 'remove') {
      modificarCantidad(id, -1);
    }
  });

  // Botón Cancelar pedido - vuelve al inicio
  document.getElementById('btn-cancelar-pedido').addEventListener('click', function () {
    if (confirm('¿Está seguro que desea cancelar el pedido? Se perderán todos los items.')) {
      pedido = [];
      restauranteActual = null;
      actualizarBadgeCarrito();
      pintarResumen();
      showToast('Pedido cancelado');
      mostrarSoloPanel(elStepRest);
    }
  });

  // Logo botón - volver al inicio
  document.getElementById('btn-inicio').addEventListener('click', function () {
    pedido = [];
    restauranteActual = null;
    actualizarBadgeCarrito();
    pintarResumen();
    mostrarSoloPanel(elStepRest);
    window.location.hash = '';
  });

  // Soporte para navegación por hash (deep linking)
  function handleHashNavigation() {
    var hash = window.location.hash;
    if (!hash) return;
    
    var panelId = hash.replace('#', '');
    var panelMap = {
      'step-restaurante': elStepRest,
      'step-productos': elStepProd,
      'step-resumen': elStepRes,
      'step-confirmacion': elStepConf
    };
    
    var targetPanel = panelMap[panelId];
    if (targetPanel) {
      // Si necesitamos un restaurante seleccionado para ciertos paneles
      if (panelId === 'step-productos' && !restauranteActual) {
        return; // No navegar sin restaurante
      }
      if (panelId === 'step-resumen' && pedido.length === 0) {
        return; // No navegar sin pedido
      }
      mostrarSoloPanel(targetPanel);
    }
  }

  // Escuchar cambios en el hash
  window.addEventListener('hashchange', handleHashNavigation);

  // Inicializar
  filtrarRestaurantes();
  actualizarBadgeCarrito();
  
  // Verificar hash inicial después de un pequeño delay para asegurar DOM listo
  setTimeout(handleHashNavigation, 100);
})();
