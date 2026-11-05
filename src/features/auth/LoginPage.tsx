import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, Lock } from 'lucide-react';
import { Logo } from '../../core/components/Logo';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { TextField } from '../../core/components/TextField';
import { loginSchema, type LoginInput } from '../../core/utils/validators';
import { useLogin } from '../../data/store/hooks';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: (location.state as { email?: string } | null)?.email ?? '' } });

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null);
    try {
      const session = await login.mutateAsync(data);
      setSuccess(true);
      setTimeout(() => {
        navigate(session.user.role === 'admin' ? '/admin' : '/home', { replace: true });
      }, 450);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Login failed');
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0" aria-hidden>
        <img
          src="/images/login_hero.jpg"
          alt=""
          className="h-full w-full object-cover animate-hero-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/90 via-bg/20 to-bg" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="SportsSync welcome page"><Logo size={44} /></Link>
          <button
            onClick={() => toast('Support chat opens here (demo)')}
            className="rounded-full border border-white/15 bg-surface/60 px-4 py-2 text-[12.5px] font-semibold text-text backdrop-blur-md min-h-9"
          >
            Help
          </button>
        </div>

        {/* Headline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 max-[700px]:mt-8"
        >
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-[12px] font-semibold uppercase tracking-[3px] text-primary"
          >
            Book. Play. Sync.
          </motion.p>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-3 font-display text-[38px] font-bold leading-[1.15] tracking-[-0.5px] text-text max-[700px]:text-[30px]"
          >
            Your game,<br />
            <span className="text-primary">your turf.</span>
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-3 text-[15px] text-muted max-[700px]:hidden"
          >
            Book premium turfs, build your squad and split the bill.
          </motion.p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
          className="mt-auto"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-t-[32px] rounded-b-[20px] border border-line bg-surface/80 p-8 backdrop-blur-[14px]"
              >
                <CheckCircle2 size={44} className="text-primary" aria-hidden />
                <p className="font-display text-lg font-semibold text-text">Signed in</p>
                <p className="text-[13px] text-muted">Taking you to the pitch…</p>
              </motion.div>
            ) : (
              <motion.div
                key={`form-${shake}`}
                initial={shake > 0 ? { x: -8 } : false}
                animate={{ x: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-t-[32px] rounded-b-[20px] border border-line bg-surface/80 p-6 backdrop-blur-[14px] max-[700px]:p-5"
                ref={cardRef}
              >
                <h2 className="font-display text-[22px] font-semibold text-text">Welcome back</h2>
                <p className="mt-0.5 text-[13px] text-muted">Sign in to continue</p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
                  {authError && (
                    <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-medium text-danger">
                      {authError}
                    </div>
                  )}
                  <TextField
                    label="Email"
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    icon={Mail}
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <TextField
                    label="Password"
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    icon={Lock}
                    showPasswordToggle
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <div className="flex items-center justify-between text-[13px]">
                    <label className="flex cursor-pointer items-center gap-2 text-muted">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-primary"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => toast('Reset link sent (demo)')}
                      className="font-semibold text-primary min-h-9 px-1"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    full
                    loading={login.isPending}
                    icon={ArrowRight}
                  >
                    Sign In
                  </PrimaryButton>
                </form>

                <p className="mt-5 text-center text-[13.5px] text-muted">
                  New to SportsSync?{' '}
                  <Link to="/register" className="font-semibold text-primary">
                    Create account
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
