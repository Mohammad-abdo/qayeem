import { Search } from 'lucide-react'

export default function SearchInput({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder = 'ابحث...',
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-black-600" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500 pr-10"
        placeholder={placeholder}
      />
    </div>
  )
}



