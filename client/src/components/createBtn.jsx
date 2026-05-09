import React, { Component } from 'react';

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

class AddBtn extends Component {
  render() {
    const { text, onClick } = this.props;
    return (
        <button 
          onClick={onClick} 
          className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95">
            <PlusIcon /> Create {text}
        </button>
    );
  }
}

export default AddBtn