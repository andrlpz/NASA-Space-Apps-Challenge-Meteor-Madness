// Simple utility function for combining class names
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

// Alternative class name utility without external dependencies
export function clsx(...inputs) {
  return inputs
    .flat()
    .filter(input => {
      if (typeof input === 'string') return input.trim();
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return false;
    })
    .join(' ');
}
