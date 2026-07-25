import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Search bar untuk tabel admin (Projects, Certificates, Skills).
 * Dipakai bersama komponen Pagination -- parent bertanggung jawab
 * mereset halaman ke 1 setiap kali `onChange` dipanggil.
 */
export default function SearchBar({ value, onChange, placeholder = "Cari..." }: SearchBarProps) {
  return (
    <div className="relative w-full sm:w-80">
      <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Bersihkan pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={13} />
        </button>
      )}
    </div>
  );
}
