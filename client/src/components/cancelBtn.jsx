import React, { Component } from 'react';

class CancelBtn extends Component {
  render() {
    const { text, onClick } = this.props;
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-6 py-2 rounded-lg border border-[#666] font-bold text-white hover:bg-[#444] transition-colors"
            >
            Cancel
        </button>
    );
  }
}

export default CancelBtn