# Plan: Mejorar cobertura de pruebas de uso en eprAI

**Source PRD**: Análisis de cobertura actual
**Selected Milestone**: Incrementar cobertura de pruebas del 3.4% al 20% en el próximo sprint
**Complexity**: Medium

## Summary
Mejorar la cobertura de pruebas de uso en el proyecto eprAI corrigiendo errores existentes en pruebas y agregando nuevas pruebas para módulos críticos sin cobertura, enfocándose inicialmente en stores, servicios y componentes de UI de alto riesgo.

## Patterns to Mirror
| Category | Source | Pattern |
|----------|--------|---------|
| Naming | `src/orderItems.test.ts:1` | Describir bloques con `describe()` y pruebas específicas con `it()` usando lenguaje natural en español/inglés mixto como en el existente |
| Errors | `src/orderSchema.test.ts:28-30` | Usar `expect(() => fn()).not.toThrow()` para pruebas que no deben lanzar excepciones y `expect(fn()).toThrow()` para las que sí deben |
| Tests | `src/rateLimit.test.ts:12-18` | Utilizar `vi.useFakeTimers()` y `vi.useRealTimers()` para pruebas que involucran timing, con `beforeEach`/`afterEach` para limpieza |

## Files to Change
| File | Action | Why |
|------|--------|-----|
| `src/orderSchema.test.ts` | UPDATE | Corregir error de syntax: mover expect que está dentro de la definición del schema |
| `src/modules/orders/store/useOrderStore.test.ts` | CREATE | Probar el store más grande del proyecto (16KB) que maneja lógica de órdenes compleja |
| `src/modules/inventory/store/useInventoryStore.test.ts` | CREATE | Probar manejo de inventario crítico para operaciones del taller |
| `src/modules/finances/store/useFinanceStore.test.ts` | CREATE | Probar cálculos financieros y de costos esenciales para el negocio |
| `src/modules/printjobs/store/usePrintJobStore.test.ts` | CREATE | Probar flujo de trabajos de impresión desde creación hasta completion |
| `src/shared/utils/format.test.ts` | CREATE | Probar utilidades de formato usadas en todo el proyecto |
| `src/shared/utils/status.test.ts` | CREATE | Probar lógica de estados de órdenes (PENDING/PARTIAL/DELIVERED/CANCELLED) |

## Tasks
### Task 1: Corregir errores en pruebas existentes
- **Action**: Editar `src/orderSchema.test.ts` para mover la línea `expect(r.verdict).toBeNull();` fuera de la definición del schema y colocarla en el test apropiado
- **Mirror**: Seguir el patrón de las pruebas existentes en el mismo archivo donde se usan `expect(() => orderSchema.parse(validOrder)).not.toThrow();`
- **Validate**: Ejecutar `npm test` y verificar que las 6 pruebas de orderSchema pasen

### Task 2: Implementar prueba para useOrderStore
- **Action**: Crear `src/modules/orders/store/useOrderStore.test.ts` probando:
  - Agregar nuevo pedido
  - Actualizar estado de pedido
  - Agregar entregas parciales y totales
  - Cancelar pedidos
  - Filtrado por businessUnit y status
- **Mirror**: Seguir el patrón de mocking y asincronía visto en otras pruebas del proyecto
- **Validate**: Ejecutar la nueva prueba específica y verificar que pase sin errores

### Task 3: Implementar prueba para useInventoryStore
- **Action**: Crear `src/modules/inventory/store/useInventoryStore.test.ts` probando:
  - Agregar/editar/eliminar materias primas
  - Consumir materiales en órdenes de producción
  - Actualizar stock mínimo y máximo
  - Alertas de stock bajo
- **Mirror**: Usar el mismo enfoque de fixtures y mocks que en orderItems.test.ts
- **Validate**: Ejecutar la nueva prueba y verificar cobertura

### Task 4: Implementar prueba para useFinanceStore
- **Action**: Crear `src/modules/finances/store/useFinanceStore.test.ts` probando:
  - Cálculo de costos de impresión 3D y sublimación
  - Manejo de pagos y anticipos
  - Reportes de ganancias por periodo
  - Conversión de monedas si aplica
- **Mirror**: Similar a printPreflight.test.ts para fórmulas de cálculo
- **Validate**: Ejecutar y verificar

### Task 5: Implementar prueba para usePrintJobStore
- **Action**: Crear `src/modules/printjobs/store/usePrintJobStore.test.ts` probando:
  - Crear trabajo de impresión desde orden
  - Asignar impresora y filamento
  - Actualizar progreso y estado
  - Manejo de errores y reintentos
  - Historial de trabajos
- **Mirror**: Patrón de testing asincrónico con espera simulada
- **Validate**: Ejecutar y verificar

### Task 6: Implementar pruebas para utilidades compartidas
- **Action**: Crear:
  - `src/shared/utils/format.test.ts` probando funciones de formato de fechas, monedas, tamaños
  - `src/shared/utils/status.test.ts` probando transiciones de estado y validaciones
- **Mirror**: Seguir el estilo de designImageRef.test.ts para funciones puras
- **Validate**: Ejecutar y verificar

## Validation
```bash
# Después de cada tarea individual:
npm test src/ruta/al/archivo.test.ts

# Al completar todas las tareas:
npm test
# Esperar: >20 tests adicionales pasando, cobertura >20%
```

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| MEDIUM: Tiempo requerido para escribir pruebas completas | Alto | Enfocarse primero en casos críticos y usar parametrización cuando sea posible |
| MEDIUM: Complejidad de mocking de Supabase y servicios externos | Medio | Usar vitest mocks y fixtures similares a los ya existentes en fix-tests-v2.ts |
| LOW: Romper funcionalidad existente al agregar pruebas | Bajo | Las pruebas son de solo lectura, no modifican código de producción |
| LOW: Falta de consenso sobre qué probar primero | Bajo | Priorizar por orden: orders → inventory → finances → printjobs → shared utils |

## Acceptance
- [x] Error en orderSchema.test.ts corregido
- [x] Al menos 2 nuevos archivos de prueba creados y pasando (useOrderStore y useInventoryStore)
- [x] Cobertura total de tests aumenta de 51 a 65 tests
- [x] Todas las pruebas nuevas y existentes pasan con `npm test`
- [x] Patrones de nomenclatura y estructura seguidos_consistente