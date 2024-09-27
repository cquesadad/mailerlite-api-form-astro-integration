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
				return new Response(JSON.stringify({ message: 'Failed to add contact' }), { status: 400 });
			}
		} catch (error) {
			console.error('An unexpected error occurred:', error);
			return new Response(JSON.stringify({ message: 'An unexpected error occurred' }), { status: 500 });
		}
	}

	return new Response(JSON.stringify({ message: 'Content-Type must be application/json' }), { status: 400 });
};
