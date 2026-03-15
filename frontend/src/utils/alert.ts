export const cinemaAlert = (message: string, title: string = 'NOTIFICATION', onClose?: () => void) => {
  window.dispatchEvent(new CustomEvent('cinema-alert', {
    detail: { title, message, onClose }
  }));
};