import React, { Component } from 'react';

class CreateMBtn extends Component {
  render() {
    const { onClick } = this.props;
    return (
        <button
            type="submit"
            className="px-8 py-2 rounded-lg border border-[rgb(29,185,84)] text-[#1DB954] font-bold hover:bg-[#1DB954] hover:text-black transition-all"
            onClick={onClick}
            aria-label="Create new item"
        >
            Create
        </button>
    );
  }
}

export default CreateMBtn