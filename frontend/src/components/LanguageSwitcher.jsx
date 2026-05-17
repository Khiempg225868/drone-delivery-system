import { LANGUAGES, useLanguage } from '../i18n/LanguageContext'

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm ${className}`}
      aria-label="Language selector"
    >
      {Object.values(LANGUAGES).map((item) => {
        const isActive = item.code === language
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`min-w-[42px] rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={item.name}
            aria-pressed={isActive}
          >
            {compact ? item.shortName : item.name}
          </button>
        )
      })}
    </div>
  )
}
