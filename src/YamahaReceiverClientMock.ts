import {YamahaReceiverClient} from "./YamahaReceiverClient";
import {YamahaReceiverInput} from "./YamahaReceiver";
import Debug from 'debug';

const debug = Debug('YamahaReceiver:ClientMock');

export class YamahaReceiverClientMock implements YamahaReceiverClient {
    async changeInput(input: YamahaReceiverInput): Promise<void> {
        debug(`changeInput ${input}`);
    }

    async on(): Promise<void> {
        debug('on');
    }

    async off(): Promise<void> {
        debug('off');
    }

    async buttonPress(buttonName: string): Promise<void> {
        debug(`buttonPress ${buttonName}`);
    }
}