import { useState } from 'preact/hooks';

interface SubscribeFormProps {}

export const SubscribeForm = ({}: SubscribeFormProps) => {
	const [email, setEmail] = useState<string>('');
	const [rgpd, setRgpd] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [message, setMessage] = useState<string | null>(null); // Estado para el mensaje

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		setRgpd(true);
		setMessage(null); // Reiniciar mensaje

		try {
			const response = await fetch('/api/subscribe.json', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json(); // Obtener datos de la respuesta

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({})); // Maneja errores sin cuerpo
				throw new Error(errorData.error || `Error en la suscripción`);
			}

			setSuccess(true);
			setMessage(data.message); // Establecer el mensaje de éxito
		} catch (err: any) {
			setError(err.message || 'Algo salió mal');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex w-96 flex-col items-center gap-2 mb-2">
			<div className="flex items-center justify-end gap-1 rounded-full w-full bg-gray-200 p-1">
				<label htmlFor="email" className="hidden flex-col items-start justify-start">
					Email:
				</label>
				<input
					className="w-full rounded-full bg-white p-2 text-black autofill:bg-white autofill:text-black h-[48px] focus:bg-white"
					id="email"
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					required
				/>

				<div className="flex h-auto items-end justify-end">
					<button
						className="gradient leading-tigh flex h-fit w-fit rounded-full px-5 py-3  text-base font-semibold tracking-wide text-white hover:text-white"
						type="submit"
					>
						Suscribirme
					</button>
				</div>
			</div>
			<label htmlFor="rgpd" className="flex items-center gap-2">
				<input
					type="checkbox"
					id="rgpd"
					checked={rgpd}
					onChange={(e) => setRgpd(e.currentTarget.checked)}
					required
					className="focus:ring-blue-500 h-4 w-4 rounded-md border-gray-300 bg-gray-100 text-gray-700  autofill:bg-white autofill:text-gray-700 focus:bg-white focus:ring-2"
				/>
				<span className="text-left text-sm leading-tight">
					Acepto la&nbsp;
					<a href="/legal/politica-privacidad" className="underline" target="_blank">
						política de privacidad
					</a>
					&nbsp;de cquesada.es
				</span>
			</label>

			{error && <p className="rounded-md bg-slate-800 px-4 py-2 text-left text-red-500 transition-all">{error}</p>}
			{success && message && (
				<p className="rounded-md bg-slate-800 px-4 py-2 text-left text-[#09b0b7] transition-all">🎉 {message}</p>
			)}
		</form>
	);
};
