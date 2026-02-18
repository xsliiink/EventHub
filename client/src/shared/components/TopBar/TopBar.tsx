import './TopBar.css'

export default function TopBar() {
  return (
    <div className="topbar-wrapper">

      {/* Search */}
      <input
        type="text"
        placeholder="Search events..."
        className="search-bar"
      />

      {/* Filters */}
      <button className="filters-bttn">
        Filters
      </button>

    </div>
  );
}