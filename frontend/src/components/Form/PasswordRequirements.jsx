import { useEffect } from 'react';

function PasswordRequirements({
  email,
  username,
  password,
  passwordsMatch,
  disableButton,
}) {
  const minLength = 8;
  const mail = (email || '').toLowerCase();
  const uname = (username || '').toLowerCase();
  const pw = password || '';

  const reqs = {
    length: pw.length >= minLength,
    notNumericOnly: /\D/.test(pw),
    notSimilarToUser:
      pw &&
      !pw.toLowerCase().includes(uname) &&
      !pw.toLowerCase().includes(mail),
    passwordsMatch: passwordsMatch,
  };

  const allValid = Boolean(
    reqs.length &&
      reqs.notNumericOnly &&
      reqs.notSimilarToUser &&
      reqs.passwordsMatch
  );
  useEffect(() => {
    if (typeof disableButton === 'function') {
      disableButton(allValid);
    }
  }, [allValid, disableButton]);

  // Simple helper
  const ReqItem = ({ ok, text }) => (
    <div className={`small ${ok ? 'text-success' : 'text-muted'}`}>
      {ok ? '✓' : '•'} {text}
    </div>
  );

  return (
    <div id="passwordHelp" className={`mt-2`} aria-live="polite">
      <ReqItem ok={reqs.length} text={`At least ${minLength} characters`} />
      <ReqItem ok={reqs.notNumericOnly} text="Not entirely numeric" />
      <ReqItem
        ok={reqs.notSimilarToUser}
        text="Not similar to username/email"
      />
      <ReqItem
        ok={reqs.passwordsMatch}
        text={passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
      />
    </div>
  );
}

export default PasswordRequirements;
