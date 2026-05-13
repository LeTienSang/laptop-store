/**
 * Utility to provide accent-insensitive search in MySQL
 * It uses a series of REPLACE functions to strip Vietnamese accents.
 */

export const vnAccentSql = (column: string): string => {
  const accents = [
    ['a', 'áàảãạăắằẳẵặâấầẩẫậ'],
    ['d', 'đ'],
    ['e', 'éèẻẽẹêếềểễệ'],
    ['i', 'íìỉĩị'],
    ['o', 'óòỏõọôốồổỗộơớờởỡợ'],
    ['u', 'úùủũụưứừửữự'],
    ['y', 'ýỳỷỹỵ'],
    ['A', 'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ'],
    ['D', 'Đ'],
    ['E', 'ÉÈẺẼẸÊẾỀỂỄỆ'],
    ['I', 'ÍÌỈĨỊ'],
    ['O', 'ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ'],
    ['U', 'ÚÙỦŨỤƯỨỪỬỮỰ'],
    ['Y', 'ÝỲỶỸỴ'],
  ];

  let sql = column;
  for (const [base, chars] of accents) {
    for (const char of chars) {
      sql = `REPLACE(${sql}, '${char}', '${base}')`;
    }
  }
  return sql;
};

/**
 * Removes accents from a string for the search parameter
 */
export const removeVnAccents = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};
