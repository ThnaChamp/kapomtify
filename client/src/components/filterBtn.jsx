import React, { Component } from 'react'
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;


class FilterBtn extends Component {
  render() {
    return (
        <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500">
            <FilterIcon /> Filter
        </button>
    )
  }
}

export default FilterBtn;