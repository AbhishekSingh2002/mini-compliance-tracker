import React from "react";

export default function SearchSort({ search, setSearch, sort, setSort }) {
  return (
    <div className="search-sort">
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
        <option value="dueDate-asc">Due Date (Earliest)</option>
        <option value="dueDate-desc">Due Date (Latest)</option>
        <option value="priority-desc">Priority (High to Low)</option>
        <option value="priority-asc">Priority (Low to High)</option>
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="status">Status</option>
      </select>
    </div>
  );
}