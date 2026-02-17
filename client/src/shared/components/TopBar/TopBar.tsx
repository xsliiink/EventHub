export default function TopBar() {
  return (
    <div className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between">

      {/* Search */}
      <input
        type="text"
        placeholder="Search events..."
        className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-black transition"
      />

      {/* Filters */}
      <button className="ml-4 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-100 transition">
        Filters
      </button>

    </div>
  );
}