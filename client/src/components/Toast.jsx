const Toast = ({ visible, message, type = "success", onClose }) => {
  if (!visible) return null;
  
  const baseClasses = "fixed bottom-4 right-4 transform transition-transform duration-300 ease-in-out z-50";
  const visibilityClasses = visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0";
  
  const typeClasses = {
    success: "border-primary",
    error: "border-red-500"
  };
  
  const iconClasses = {
    success: "text-primary",
    error: "text-red-500"
  };
  
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle"
  };
  
  const titles = {
    success: "Success!",
    error: "Error"
  };
  
  return (
    <div className={`${baseClasses} ${visibilityClasses}`}>
      <div className={`bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 ${typeClasses[type]} flex items-center`}>
        <div className={`${iconClasses[type]} mr-3`}>
          <i className={`fas ${icons[type]} text-xl`}></i>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{titles[type]}</h4>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-6 text-gray-400 hover:text-gray-600"
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;
