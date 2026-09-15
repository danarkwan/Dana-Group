import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/auth/LoginForm';
import Logo from '@/components/ui/Logo';
import styles from './login.module.css';

export default async function LoginPage() {
  const t = await getTranslations('Auth');
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.imageBackground}>
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logoIconContainer}>
            <Logo />
          </div>
          <h1 className={styles.title}>{t('login')}</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
