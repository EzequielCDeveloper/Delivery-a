# Plan de Acción - Correcciones UI/UX Prototipo Delivery

## RESUMEN DE PROBLEMAS ENCONTRADOS

### Iteración 1 - UI/UX Visual
| # | Problema | Severidad | Archivo(s) |
|---|----------|-----------|------------|
| 1 | Etiquetas confusas en indicadores de paso | Alta | index.html |
| 2 | Indicadores de paso no intuitivos (números vs contexto) | Alta | index.html, script.js |
| 3 | Botón "Cambiar sitio" poco visible y confuso | Media | index.html |
| 4 | Categorías en minúsculas (ej: "hamburguesas") | Baja | script.js |
| 5 | Sin feedback visual al agregar platos | Alta | script.js |
| 6 | Botón sticky "Ver resumen" poco visible | Alta | index.html, styles.css |
| 7 | Diseño lista platos sin información de cantidad | Alta | script.js, styles.css |
| 8 | Footer innecesario en móvil (ocupa espacio) | Baja | index.html, styles.css |
| 9 | Títulos de sección repetitivos o genéricos | Media | index.html |
| 10 | Spacing inconsistente en cards de restaurantes | Baja | styles.css |

### Iteración 2 - Interacción y Accesibilidad
| # | Problema | Severidad | Archivo(s) |
|---|----------|-----------|------------|
| 11 | No hay indicador de cantidad en los platos seleccionados | Alta | script.js |
| 12 | No se puede eliminar items del pedido | Alta | script.js |
| 13 | No hay forma de modificar cantidad desde el resumen | Alta | script.js |
| 14 | Flujo confuso para añadir más productos | Alta | script.js |
| 15 | aria-label faltante en botones dinámicos | Media | script.js |
| 16 | Focus states insuficientes | Media | styles.css |
| 17 | Contraste de color insuficiente en algunos elementos | Baja | styles.css |
| 18 | No hay soporte para teclado en navigation | Media | script.js |

### Iteración 3 - Bugs Funcionales
| # | Problema | Severidad | Archivo(s) |
|---|----------|-----------|------------|
| 19 | El pedido no persiste al cambiar de restaurante | Alta | script.js |
| 20 | Posible XSS en imágenes (no hay sanitización de src) | Alta | script.js |
| 21 | Error si se cambia filtro cuando no hay restaurantes | Baja | script.js |
| 22 | El total muestra "0,00 €" en negativo si hay bug | Baja | script.js |
| 23 | No hay validación de precio antes de agregar | Media | script.js |
| 24 | Memory leak potencial al recrear elementos DOM | Baja | script.js |

---

## PLAN DE ACCIÓN NUMERADO

### FASE 1: Correcciones Críticas de Interacción (Prioridad Alta)

**1. Agregar indicador de cantidad en el menú**
- Modificar script.js para mostrar cantidad al lado de cada plato si ya está en el pedido
- Actualizar función `abrirMenu()` para verificar si el plato ya existe en `pedido`

**2. Agregar botones de cantidad (+/-) en el resumen**
- Modificar `pintarResumen()` para incluir botones de incremento/decremento
- Agregar funcionalidad para eliminar items (botón con icono X o "-")
- Habilitar edición de cantidad desde el panel de resumen

**3. Agregar feedback visual al agregar platos**
- Mostrar toast/notification temporal ("Margarita añadida")
- Animación breve en el botón del plato
- Actualizar contador en header (badge con número de items)

**4. Persistir pedido al cambiar de restaurante**
- Mantener el pedido actual al navegar atrás
- Warning si el usuario intenta cambiar de restaurante con pedido activo

### FASE 2: Correcciones de UI/UX Visual

**5. Renombrar indicadores de paso**
- Cambiar "1. Local" → "1. Elegir local"
- "2. Menú" → "2. Elegir comida"
- "Resumen" → "3. Revisar pedido"

**6. Mejorar botón "Volver"**
- Cambiar etiqueta a "← Volver al menú" o "Cambiar restaurante"
- Posicionar mejor (antes del título, no flotando)

**7. Mejorar sticky CTA**
- Cambiar texto a "Ver pedido (X items)" mostrando cantidad
- Mejorar visibilidad con color más destacado

**8. Capitalizar categorías**
- En `script.js`: mostrar "Hamburguesas" en vez de "hamburguesas"
- Aplicar capitalize en la función de renderizado

**9. Ocultar footer en móvil**
- Agregar media query para `display: none` en pantallas pequeñas

**10. Mejorar diseño de lista de platos**
- Agregar descripción breve del plato
- Mostrar disponibilidad (si aplica)
- Separador visual más claro entre items

### FASE 3: Correcciones de Accesibilidad

**11. Agregar atributos aria dinámicos**
- aria-live="polite" para notificaciones
- aria-label en todos los botones
- role="status" para el resumen

**12. Mejorar focus states**
- Asegurar que todos los elementos interactivos tengan focus-visible
- Agregar outline personalizado con color de contraste

**13. Soporte para navegación por teclado**
- Agregar tabindex apropiado
- Asegurar orden de tab lógico

**14. Agregar skips de navegación**
- Link "Saltar al contenido" para lectores de pantalla

### FASE 4: Correcciones de Seguridad y Bugs

**15. Sanitizar atributos src de imágenes**
- Validar que las URLs de imágenes sean seguras
- Usar solo rutas relativas o dominios permitidos

**16. Validar datos**
- Verificar que precios sean números positivos
- Validar cantidades antes de operar

**17. Manejar caso de pedido vacío**
- Deshabilitar botón "Confirmar pedido" si no hay items
- Mostrar mensaje más claro que "Nada seleccionado"

### FASE 5: Mejoras Adicionales (Prioridad Baja)

**18. Agregar animaciones suaves**
- Transiciones CSS entre paneles
- Animación al agregar items

**19. Mejorar mensajes de confirmación**
- Including estimated delivery time
- Pedido number for reference

**20. Agregar loading states**
- Simular carga al cambiar de panel (opcional)

---

## ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **Inmediato**: #2, #3, #4 (mejoras de interacción)
2. **Rápido**: #5, #6, #7, #8 (UI visual)
3. **Médiano**: #1, #11, #12, #13 (funcionalidad y accesibilidad)
4. **Después**: #15, #16, #17 (seguridad y bugs)
5. **Último**: #18, #19, #20 (mejoras menores)

---

*Documento generado automáticamente tras análisis iterativo del proyecto.*
*Total de problemas identificados: 24*
*Fecha: 2026-03-26*
