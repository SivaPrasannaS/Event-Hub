export const showToastEvent = (type, message) => {
  window.dispatchEvent(new CustomEvent('eventhub-toast', { detail: { type, message } }));
};

export const useToast = () => ({
  success: (message) => showToastEvent('success', message),
  error: (message) => showToastEvent('danger', message),
});

export default useToast;
