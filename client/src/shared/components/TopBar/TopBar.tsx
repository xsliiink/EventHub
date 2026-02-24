import './TopBar.css'

export default function TopBar() {
  return (
    <div className="topbar-wrapper">
      <div className="search-group">
      <input
        type="text"
        placeholder="Search events..."
        className="search-input"
      />
      <button className="filters-button">
        Filters
      </button>
    </div>
  </div>
  );
}