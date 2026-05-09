import { useAuth } from '@context/AuthContext'
import { useLang } from '@context/LangContext'
import { cardClass, cx, levelBadgeClass } from '@utils/ui'

function MonProfil() {
  const { user } = useAuth()
  const { t } = useLang()

  return (
    <div className={cx(cardClass.base, 'p-6 sm:p-8')}>
      <div className="mb-6 space-y-3">
        <p className="section-kicker">Profil</p>
        <h1 className="section-title">👤 {t('Mein Profil', 'Mon profil')}</h1>
        <p className="section-copy">{t('Informationen prüfen', 'Vérifiez vos informations')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={cx(cardClass.soft, 'p-5')}>
          <span className="input-label">{t('Vorname', 'Prénom')}</span>
          <span className="mt-2 block text-xl font-semibold text-brand-text">{user?.prenom || '-'}</span>
        </div>
        <div className={cx(cardClass.soft, 'p-5')}>
          <span className="input-label">{t('Nachname', 'Nom')}</span>
          <span className="mt-2 block text-xl font-semibold text-brand-text">{user?.nom || '-'}</span>
        </div>
        <div className={cx(cardClass.soft, 'p-5')}>
          <span className="input-label">Email</span>
          <span className="mt-2 block text-xl font-semibold text-brand-text">{user?.email || '-'}</span>
        </div>
        <div className={cx(cardClass.soft, 'p-5')}>
          <span className="input-label">{t('Niveau', 'Niveau')}</span>
          <span className="mt-3 inline-flex"><span className={levelBadgeClass(user?.niveau || 'A1')}>{user?.niveau || 'A1'}</span></span>
        </div>
        <div className={cx(cardClass.soft, 'p-5 md:col-span-2')}>
          <span className="input-label">{t('Ziel', 'Objectif')}</span>
          <span className="mt-2 block text-xl font-semibold text-brand-text">{user?.objectif || '-'}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-brand-brown">
        {t('Profiländerung bientôt', 'Modification du profil : bientôt')}
      </p>
    </div>
  )
}

export default MonProfil

