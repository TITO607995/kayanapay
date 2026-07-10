import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
}

export const echo = typeof window !== 'undefined' ? new Echo({
    broadcaster: 'reverb',
    // Sesuaikan key ini dengan REVERB_APP_KEY yang ada di .env Laravel lu
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'kayana_reverb_key', 
    wsHost: 'kayanamart.my.id',
    wsPort: 8080, // Pastikan port ini sesuai dengan port container kayana_reverb lu
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
}) : null;