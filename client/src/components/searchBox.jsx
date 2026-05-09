import React, { Component } from 'react';

class SearchBox extends Component {
  render() {
    return (
      <input 
        type="text"
        placeholder={this.props.placeholder}
        className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-48 focus:outline-none focus:border-[#1DB954] text-[#e0e0e0]"
      />
    );
  }
}

export default SearchBox;
