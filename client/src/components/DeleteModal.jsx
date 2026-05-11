import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, targetName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-white text-lg font-bold mb-2">{title || "Confirm Delete"}</h3>
          
          <p className="text-gray-400 text-sm mb-8">
            {message || "Are you sure you want to delete"} 
            {targetName && <span className="text-white font-mono ml-1">{targetName}</span>}? 
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 border border-[#444] rounded-lg text-sm font-bold hover:bg-[#333] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
