
const camelCase = (str) => {
  const parts = str.split('-');
  if (parts.length === 0) return '';
  const first = parts[0].toLowerCase();
  let result = first;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part.length > 0) {
      result += part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  return result;
};

module.exports = camelCase;

// Example:
// camelCase('hello-there');
// returns 'helloThere'
