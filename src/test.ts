import { UnisonHT, WebApi } from '@unisonht/unisonht';
import { YamahaReceiver } from '.';

const unisonht = new UnisonHT({});
unisonht.use(new WebApi({ port: 3000 }));

unisonht.use(
  new YamahaReceiver('receiver', {
    address: '192.168.0.165',
  }),
);

unisonht.start();
