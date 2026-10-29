/**
 * Convierte un número entero positivo (hasta millones) a su representación en palabras en español.
 * Diseñado para la emisión de recibos y pagarés comerciales de Raíces ERP.
 */
export function numberToWordsSpanish(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'cero';

  const UNIDADES = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
    'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
  ];

  const DECENAS = [
    '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
  ];

  const CENTENAS = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
    'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
  ];

  function convertSection(val: number): string {
    if (val === 0) return '';
    if (val === 100) return 'cien';

    let out = '';
    const c = Math.floor(val / 100);
    const d = val % 100;

    if (c > 0) {
      out += CENTENAS[c] + ' ';
    }

    if (d < 30) {
      out += UNIDADES[d];
    } else {
      const dec = Math.floor(d / 10);
      const uni = d % 10;
      out += DECENAS[dec];
      if (uni > 0) {
        out += ' y ' + UNIDADES[uni];
      }
    }

    return out.trim();
  }

  if (n < 1000) {
    return convertSection(n);
  }

  if (n < 1_000_000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    const prefijo = miles === 1 ? 'mil' : `${convertSection(miles)} mil`;
    const sufijo = resto > 0 ? ` ${convertSection(resto)}` : '';
    return `${prefijo}${sufijo}`.trim();
  }

  const millones = Math.floor(n / 1_000_000);
  const resto = n % 1_000_000;
  const prefijo = millones === 1 ? 'un millón' : `${convertSection(millones)} millones`;
  const sufijo = resto > 0 ? ` ${numberToWordsSpanish(resto)}` : '';
  return `${prefijo}${sufijo}`.trim();
}
