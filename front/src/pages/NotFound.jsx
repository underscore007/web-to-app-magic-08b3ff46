import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import Icon from '@components/ui/Icon'
import { buttonClass, cardClass, cx } from '@utils/ui'

function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="shell">
      <div className={cx(cardClass.base, 'overflow-hidden p-8 text-center sm:p-12')}>
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-brand-sky text-brand-blue shadow-soft" aria-hidden="true">
          <div className="relative">
            <span className="font-display text-4xl font-semibold">404</span>
            <span className="absolute -right-4 -top-4 rounded-full bg-white p-2 shadow-soft">
              <Icon name="warning" size={20} className="icon" />
            </span>
          </div>
        </div>

        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-brand-text">Seite nicht gefunden !</h1>
        <p className="mt-3 text-lg text-brand-brown">Cette page est introuvable</p>
        <p className="mx-auto mt-4 max-w-2xl text-brand-brown">
          Der Link est peut-être incorrect ou cette page a été supprimée.
          <br />
          <span className="text-sm uppercase tracking-[0.24em] text-brand-blue">Le lien est peut-être incorrect ou cette page a été supprimée.</span>
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button className={buttonClass.ghost} onClick={() => navigate(-1)} type="button">
            <Icon name="arrowLeft" size={18} className="icon" /> Retour
          </button>
          <Link to={user ? '/dashboard' : '/'} className={buttonClass.primary}>
            <Icon name="home" size={18} className="icon" /> {user ? 'Tableau de bord' : 'Accueil'}
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          <p className="section-kicker">Pages utiles</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/cours" className={cx(cardClass.soft, 'flex items-center justify-center gap-2 p-4 text-brand-text hover:border-brand-blue')}>
              <Icon name="book" size={16} className="icon" /> Cours
            </Link>
            <Link to="/guide" className={cx(cardClass.soft, 'flex items-center justify-center gap-2 p-4 text-brand-text hover:border-brand-blue')}>
              <Icon name="link" size={16} className="icon" /> Guide Allemagne
            </Link>
            <Link to="/sprechen" className={cx(cardClass.soft, 'flex items-center justify-center gap-2 p-4 text-brand-text hover:border-brand-blue')}>
              <Icon name="mic" size={16} className="icon" /> Sprechen
            </Link>
            <Link to="/communaute" className={cx(cardClass.soft, 'flex items-center justify-center gap-2 p-4 text-brand-text hover:border-brand-blue')}>
              <Icon name="messageCircle" size={16} className="icon" /> Communaute
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound

