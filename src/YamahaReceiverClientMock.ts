import { YamahaReceiverClient } from './YamahaReceiverClient';
import { YamahaReceiverInput } from './YamahaReceiver';
import Debug from 'debug';
import { YamahaReceiverButton } from './YamahaReceiverButton';

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

  public async buttonPress(buttonName: YamahaReceiverButton): Promise<void> {
    debug(`buttonPress ${buttonName}`);
  }
}
