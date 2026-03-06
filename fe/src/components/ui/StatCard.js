import React from 'react';

const StatCard = ({ label, value, valueClass = "text-slate-800" }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
};

export default StatCard;
