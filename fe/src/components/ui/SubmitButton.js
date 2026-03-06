import React from 'react';

const SubmitButton = ({ loading, text, loadingText }) => {
  return (
    <button 
      type="submit" 
      disabled={loading} 
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2463eb] py-4 text-lg font-bold text-white shadow-lg shadow-[#2463eb]/25 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? loadingText : text}
    </button>
  );
};

export default SubmitButton;
