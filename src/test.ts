import { UnisonHT, WebApi } from '@unisonht/unisonht';
import { YamahaReceiver } from '.';

const port = 3000;
const unisonht = new UnisonHT({});
unisonht.use(new WebApi({ port }));

unisonht.use(
    new YamahaReceiver('receiver', {
        address: '192.168.0.165',
    }),
);

async function start() {
    await unisonht.start();
    console.log(`Listening http://localhost:${port}`);
}

start();
