export const generateCode = (prefix, number) => {
  return `${prefix}-${String(number).padStart(5, '0')}`;
};
