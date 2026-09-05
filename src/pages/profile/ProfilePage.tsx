import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import ProfileSection from './sections/ProfileSection'
import BillingSection from './sections/BillingSection'
import WhatsAppSection from './sections/WhatsAppSection'
import SecuritySection from './sections/SecuritySection'

type SettingsSection = 'profile' | 'security' | 'whatsapp' | 'billing'

const navSections: Array<{
  label: string
  items: Array<{ label: string; icon: string; section: SettingsSection; enabled: boolean }>
}> = [
  {
    label: 'Account',
    items: [
      { label: 'My profile', icon: 'ti-user-circle', section: 'profile', enabled: true },
      { label: 'Security', icon: 'ti-lock', section: 'security', enabled: true },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'WhatsApp', icon: 'ti-brand-whatsapp', section: 'whatsapp', enabled: true },
    ],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Plan & billing', icon: 'ti-star', section: 'billing', enabled: true },
    ],
  },
]

function SecondaryNav({
  activeSection,
  onSelect,
}: {
  activeSection: SettingsSection
  onSelect: (section: SettingsSection) => void
}) {
  return (
    <>
      {/* Mobile — horizontal scrollable tab row */}
      <nav className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {navSections.flatMap(section => section.items).map(item => {
          const active = item.section === activeSection
          return (
            <div
              key={item.section}
              onClick={item.enabled ? () => onSelect(item.section) : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap shrink-0 ${
                item.enabled ? 'cursor-pointer' : 'cursor-default opacity-50'
              } ${active ? 'bg-brand-50' : 'bg-white border border-cream-border'}`}
            >
              <i className={`ti ${item.icon} text-base ${active ? 'text-brand-400' : 'text-gray-400'}`} aria-hidden="true" />
              <span className={`text-sm ${active ? 'text-brand-400 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Desktop — grouped vertical list */}
      <nav className="hidden md:block w-50 shrink-0 h-fit bg-white rounded-2xl border border-cream-border p-2">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-xs font-medium text-gray-200 uppercase tracking-[0.07em] px-3 pt-2.5 pb-1.5">
              {section.label}
            </p>
            {section.items.map(item => {
              const active = item.section === activeSection
              return (
                <div
                  key={item.section}
                  onClick={item.enabled ? () => onSelect(item.section) : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                    item.enabled ? 'cursor-pointer' : 'cursor-default opacity-50'
                  } ${active ? 'bg-brand-50' : 'hover:bg-gray-25'}`}
                >
                  <i className={`ti ${item.icon} text-base ${active ? 'text-brand-400' : 'text-gray-400'}`} aria-hidden="true" />
                  <span className={`text-sm ${active ? 'text-brand-400 font-medium' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
            <hr className="border-t border-gray-50 my-1.5" />
          </div>
        ))}
      </nav>
    </>
  )
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Settings" subtitle="Manage your account details and preferences." />

      <div className="flex flex-col md:flex-row gap-5">
        <SecondaryNav activeSection={activeSection} onSelect={setActiveSection} />

        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-cream-border overflow-hidden">
              <ProfileSection />
            </div>
          )}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'whatsapp' && <WhatsAppSection />}
          {activeSection === 'billing' && <BillingSection />}
        </div>
      </div>
    </div>
  )
}
