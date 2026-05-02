import RegistrationForm from "../components/RegistrationForm.jsx";

export default function Register() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">Crew onboarding</p>
        <h2 className="mt-2 text-3xl font-black">Register Team</h2>
      </div>
      <RegistrationForm />
    </div>
  );
}
