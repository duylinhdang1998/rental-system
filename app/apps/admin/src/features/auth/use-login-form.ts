import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './use-session';

export function useLoginForm() {
  const navigate = useNavigate();
  const { error, login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loginPromise = login({ password, username });
      void navigate('/');
      await loginPromise;
    } catch {
      void navigate('/login', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };
  return { error, password, setPassword, setUsername, submit, submitting, username };
}
