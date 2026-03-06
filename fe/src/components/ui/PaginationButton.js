import React from 'react';

const PaginationButton = ({ icon, disabled = false, ...props }) => {
  return (
    <button 
      {...props}
      disabled={disabled}
      className="p-2 text-slate-400 hover:text-[#2463eb] disabled:opacity-30 transition-colors"
    >
      {icon}
    </button>
  );
};

export default PaginationButton;
