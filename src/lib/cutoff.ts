export function orderingOpen() {
    const now = new Date();
  
    const hour = now.getHours();
  
    return hour < 23;
  }