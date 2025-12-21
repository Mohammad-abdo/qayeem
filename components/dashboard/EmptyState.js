export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action = null,
  className = '',
  compact = false
}) {
  const paddingClass = compact ? 'py-12' : 'p-32'
  const iconSize = compact ? 'w-16 h-16' : 'w-20 h-20'
  const iconInnerSize = compact ? 'w-8 h-8' : 'w-10 h-10'
  
  return (
    <div className={`bg-white rounded-xl shadow-lg ${paddingClass} border border-black-100 text-center ${className}`}>
      {Icon && (
        <div className={`${iconSize} bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`${iconInnerSize} text-gray-400`} />
        </div>
      )}
      <p className={`text-black-600 font-medium ${compact ? 'text-base' : 'text-lg'}`}>{title}</p>
      {description && (
        <p className="text-sm text-black-400 mt-2">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

