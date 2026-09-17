type PropriedadesCampoLogin = {
  autoComplete: string;
  id: string;
  label: string;
  name: string;
  type: "email" | "password";
};

export function CampoLogin({
  autoComplete,
  id,
  label,
  name,
  type,
}: PropriedadesCampoLogin) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
      />
    </>
  );
}
