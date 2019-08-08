import {UnisonHT} from "unisonht";
import {YamahaReceiver} from ".";

const unisonht = new UnisonHT({});

unisonht.use(new YamahaReceiver('receiver', {
    address: '192.168.0.165'
}));

unisonht.listen(3000);
