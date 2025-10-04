import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#2c2c2e',
          color: '#ffffff',
          border: '1px solid #38383a',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(44, 44, 46, 0.9)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        },
        // Success
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#32d74b',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid #32d74b',
          },
        },
        // Error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ff453a',
            secondary: '#ffffff',
          },
          style: {
            border: '1px solid #ff453a',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#ffd60a',
            secondary: '#000000',
          },
        },
      }}
      containerStyle={{
        top: 80, // Below header
      }}
      containerClassName="toast-container"
    />
  );
}
