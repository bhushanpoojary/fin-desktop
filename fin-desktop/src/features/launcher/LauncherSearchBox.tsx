import React from "react";

export interface LauncherSearchBoxProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export const LauncherSearchBox: React.FC<LauncherSearchBoxProps> = ({
  searchText,
  onSearchTextChange,
  category,
  onCategoryChange,
  categories
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onSearchTextChange("");
    }
  };

  return (
    <div className="launcher-search-box">
      <input
        type="text"
        className="launcher-search-input"
        placeholder="Search apps…"
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <select
        className="launcher-category-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};
