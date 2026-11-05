import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { Logo } from '../../core/components/Logo';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { TextField } from '../../core/components/TextField';
import { registerSchema, type RegisterInput } from '../../core/utils/validators';
import { useRegister } from '../../data/store/hooks';
import { db } from '../../data/repositories/db';

const sports = db.sports.map((s) => s.sport_name);

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register: reg,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'player' },
  });

  const preferred = watch('preferred_sport');

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('Account created! You can now sign in.');
      navigate('/login', { replace: true, state: { email: data.email } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-y-auto">
      <div className="fixed inset-0" aria-hidden>
        <img src="/images/login_hero.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/95 via-bg/80 to-bg" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[440px] px-5 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-text min-h-11">
            <ArrowLeft size={16} aria-hidden /> Back
          </Link>
          <Logo size={36} withWordmark={false} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-8"
        >
          <h1 className="font-display text-[30px] font-bold text-text">Create account</h1>
          <p className="mt-1 text-[14px] text-muted">Join Manjalpur Sports as a player.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <TextField label="Full name" id="full_name" placeholder="Noel Louis" icon={User} error={errors.full_name?.message} {...reg('full_name')} />
            <TextField label="Email" id="email" type="email" placeholder="you@example.com" icon={Mail} error={errors.email?.message} {...reg('email')} />
            <TextField label="Phone" id="phone_number" type="tel" placeholder="+91 98765 43210" icon={Phone} error={errors.phone_number?.message} {...reg('phone_number')} />
            <TextField label="Password" id="password" type="password" placeholder="Min 4 characters" icon={Lock} showPasswordToggle error={errors.password?.message} {...reg('password')} />
            <TextField label="Confirm password" id="confirm_password" type="password" placeholder="Repeat password" icon={Lock} showPasswordToggle error={errors.confirm_password?.message} {...reg('confirm_password')} />

              <div className="space-y-3">
                <p className="text-[12.5px] font-medium text-muted">Preferred sport</p>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('preferred_sport', s)}
                      className={clsx(
                        'rounded-full border px-3.5 py-2 text-[12.5px] font-semibold min-h-9',
                        preferred === s ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <TextField label="City" id="city" placeholder="Vadodara" {...reg('city')} />
              </div>

            <PrimaryButton type="submit" size="lg" full loading={registerMutation.isPending}>
              Create account
            </PrimaryButton>
          </form>

          <p className="mt-5 text-center text-[13.5px] text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
