export const formatCLP = (value) => {
  // value en pesos chilenos como entero: 6298 => "$6.298"
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};
