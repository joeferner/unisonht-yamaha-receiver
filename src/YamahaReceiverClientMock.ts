import { YamahaReceiverClient } from './YamahaReceiverClient';
import Debug from 'debug';
import { YamahaReceiverButton } from './YamahaReceiverButton';
import { YamahaReceiverInput, YamahaReceiverStatus, YamahaReceiverZone } from './YamahaReceiverStatus';
import { PowerStatus } from '@unisonht/unisonht';

const debug = Debug('YamahaReceiver:ClientMock');

export class YamahaReceiverClientMock implements YamahaReceiverClient {
    public async changeInput(input: YamahaReceiverInput): Promise<void> {
        debug(`changeInput ${input}`);
    }

    public async on(): Promise<void> {
        debug('on');
    }

    public async off(): Promise<void> {
        debug('off');
    }

    public async powerToggle(): Promise<void> {
        debug('power toggle');
    }

    public async buttonPress(buttonName: YamahaReceiverButton): Promise<void> {
        debug(`buttonPress ${buttonName}`);
    }

    public async getStatus(zone: YamahaReceiverZone): Promise<YamahaReceiverStatus> {
        return {
            input: YamahaReceiverInput.HDMI1,
            mute: false,
            volume: -1,
            power: PowerStatus.STANDBY,
        };
    }
}
