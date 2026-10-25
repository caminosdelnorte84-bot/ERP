export const OrderStatus = {
  PENDING: 'pendiente',
  PARTIAL: 'parcial',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const CUSTOMER_TYPES = [
  { value: 'MINORISTA', label: 'Minorista' },
  { value: 'MAYORISTA', label: 'Mayorista' },
  { value: 'CORPORATIVO', label: 'Corporativo' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'MercadoPago', label: 'MercadoPago' },
  { value: 'Tarjeta', label: 'Tarjeta' },
] as const;

export const DELIVERY_STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
};

export const DELIVERY_STATUS_LABELS = {
  PENDING: 'Pendiente',
  DELIVERED: 'Entregado',
};

export const ORDER_STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.PENDING:
      return OrderStatus.PARTIAL;
    case OrderStatus.PARTIAL:
      return OrderStatus.DELIVERED;
    case OrderStatus.DELIVERED:
      return null;
    case OrderStatus.CANCELLED:
      return null;
  }
}

export function getPreviousStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.PENDING:
      return null;
    case OrderStatus.PARTIAL:
      return OrderStatus.PENDING;
    case OrderStatus.DELIVERED:
      return OrderStatus.PARTIAL;
    case OrderStatus.CANCELLED:
      return null;
  }
}

export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  // Allowed transitions:
  // PENDING -> PARTIAL, CANCELLED
  // PARTIAL -> DELIVERED, CANCELLED
  // DELIVERED -> (none)
  // CANCELLED -> (none)
  if (from === OrderStatus.PENDING) {
    return to === OrderStatus.PARTIAL || to === OrderStatus.CANCELLED;
  }
  if (from === OrderStatus.PARTIAL) {
    return to === OrderStatus.DELIVERED || to === OrderStatus.CANCELLED;
  }
  return false; // DELIVERED and CANCELLED cannot transition to any other status
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pendiente';
    case OrderStatus.PARTIAL:
      return 'Parcial';
    case OrderStatus.DELIVERED:
      return 'Entregado';
    case OrderStatus.CANCELLED:
      return 'Cancelado';
  }
}

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case OrderStatus.PARTIAL:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case OrderStatus.DELIVERED:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case OrderStatus.CANCELLED:
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  }
}
