# 🚀 Mailerlite API form Astro integration

[<img src="https://cquesada.es/images/clone-git.svg" width="180px" alt="Git Clone" />](https://github.com/cquesadad/mailerlite-api-form-astro-integration)

> 🧑‍🚀 **¿Cómo empezar?** Puedes clonar el repositorio o copiar el código a continuación siguiendo las instrucciones

![Git Clone](https://cquesada.es/images/posts/tutorial-integracion-api-mailerlite-astro.jpg)

## Estructura del Proyecto

Primero que todo, veamos la estructura que he creado en el repositorio de Github de muestra.

Los archivos que he agregado son `SubscribeForm.tsx` y `subscribe.json.ts`. Estos son los que deberás agregar. Adiconalmente deberás hacer cambios en el archivo de `astro.config.mjs` y crear un archivo `.env`.

Una web accesible no solo es fundamental para la inclusión, sino que también mejora la experiencia de todos los usuarios, haciendo que los sitios sean más intuitivos y fáciles de usar, incluso para clientes que no tienen limitaciones.

```
├── public/
├── src/
│   ├── components/
│   │   └── newsletter/
│   │       └── SubscribeForm.tsx // Agregar
│   ├── content/
│   ├── layouts/
│   └── pages/
│       └── api/
│           └── subscribe.json.ts // Agregar
├── .env
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

## 1. Configuración de Astro para SSR y Vercel

Para habilitar el renderizado hybrid de Astro, debes modificar tu archivo de configuración `astro.config.mjs`. Esto te permitirá que los componentes o rchivos que desees utilicen renderizado del lado del servidor, mientras que el resto se mantendrá estático. Usamos Vercel como adaptador para el despliegue.

Primero vamos a utilizar la función rápida de instalación para las integraciones de Preact y Vercel en nuestro proyecto

```
npx astro add preact
```

```
npx astro add vercel
```

A continuación el código que debes agregar para hacer `hybrid` el proyecto y cómo ha quedado mi archivo configurado:

```
astro.config.mjs

// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), preact(), tailwind()],
  output: 'hybrid', // Agregar línea de salida SSR
  adapter: vercel(),
});
```

Esta configuración permite a Astro generar contenido estático por defecto en todas las páginas, pero deja la ejecución del lado del servidor SSR para rutas específicas, como por ejemplo la API de Mailerlite.

## 2. Gestión del API Key

Previamente debes acceder a tu cuenta de Mailerlite y en el apartado de integrations usar la API creando una nueva API Key. Esto te generará el hash que debes utilizar en el archivo. Para trabajar de forma segura con la clave API de Mailerlite, crea el archivo .env en la raiz del proyecto.

Solamente para tu sitio en desarrollo en el entorno local, posteriormente si lo publicas en Vercel deberás agregarlo a las variables de entorno del proyecto.

Esta es la variable que debes añadir al .env:

```
.env

MAILERLITE_API_KEY=TU_API_KEY_AQUI
```

## 3. Componente del Formulario

Crea el componente que tendrá el formulario de Preact con el nombre `SubscribeForm.tsx`. Este componente se encarga de maneja el estado del formulario, los errores y envía la información al endpoint /pages/api/subscribe.

```
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
```

## 4. Crea el endpoint de la API Mailerlite

Crea el archivo `subscribe.json.ts`, es el encargado de manejar la lógica del servidor para interactuar con la API de Mailerlite. Se encuentra en la carpeta /pages/api/ y responde a solicitudes POST y GET para agregar nuevos suscriptores.

```
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({}) => {
	return new Response('Ok', { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
	// Comprueba si la petición es en formato JSON
	if (request.headers.get('content-type') === 'application/json') {
		const body = await request.json();
		const email = body.email;

		// Validar el formato del email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
		}

		const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api/subscribers';
		const MAILERLITE_API_KEY = import.meta.env.MAILERLITE_API_KEY;

		if (!MAILERLITE_API_KEY) {
			console.error('No MAILERLITE_API_KEY defined');
			return new Response(JSON.stringify({ message: 'API key not found' }), { status: 400 });
		}

		// Endpoint para verificar si el email ya está suscrito
		const MAILERLITE_CHECK_URL = `${MAILERLITE_API_URL}/${email}`;

		try {
			const checkResponse = await fetch(MAILERLITE_CHECK_URL, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					Authorization: `Bearer ${MAILERLITE_API_KEY}`,
				},
			});

			if (checkResponse.ok) {
				// El email ya está suscrito
				return new Response(JSON.stringify({ message: 'Ya estabas suscrito al Newsletter' }), { status: 200 });
			}

			const payload = {
				email: email,
				groups: ['133268454709921702'], //El ID de la lista de suscripción de Mailerlite
			};

			console.log('Hola');

			const response = await fetch(MAILERLITE_API_URL, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					Authorization: `Bearer ${MAILERLITE_API_KEY}`,
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				console.log('Contact added successfully');
				return new Response(JSON.stringify({ message: '¡Te has suscrito exitosamente!' }), { status: 200 });
			} else {
				const errorResponse = await response.text();
				console.error('Failed to add contact:', errorResponse);
				return new Response(JSON.stringify({ message: 'Erro al añadir el contacto' }), { status: 400 });
			}
		} catch (error) {
			console.error('An unexpected error occurred:', error);
			return new Response(JSON.stringify({ message: 'Erro inesperado' }), { status: 500 });
		}
	}

	return new Response(JSON.stringify({ message: 'Content-Type must be application/json' }), { status: 400 });
};
```

## Conclusiones

Si sigues los pasos y utilizas el código adecuadamente tendrás un formulario de suscripción funcional que se comunica con la API de Mailerlite en un entorno SSR híbrido usando Astro y Preact. Ten en cuenta la seguridad a la hora de gestionar tu claves API tanto en modo desarrollo como en tu sitio en producción.

**→ Si tienes dudas puedes suscribirte o escribirme a** [info@cquesada.es](mailto:info@cquesada.es)

Te atenderé lo antes posible.
