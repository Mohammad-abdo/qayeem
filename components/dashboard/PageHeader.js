import Link from 'next/link'

export default function PageHeader({ 
  title, 
  description, 
  actionButton = null,
  gradient = true 
}) {
  const headerClasses = gradient
    ? 'bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl'
    : 'bg-white rounded-2xl p-6 md:p-8 border border-black-100 shadow-lg'

  const titleClasses = gradient
    ? 'text-3xl md:text-4xl font-bold mb-2'
    : 'text-3xl font-bold text-black-500 mb-2'

  const descClasses = gradient
    ? 'text-primary-100 text-lg'
    : 'mt-2 text-black-600'

  return (
    <div className={headerClasses}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={titleClasses}>{title}</h1>
          {description && <p className={descClasses}>{description}</p>}
        </div>
        {actionButton}
      </div>
    </div>
  )
}

