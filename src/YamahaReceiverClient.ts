import { YamahaReceiverInput } from './YamahaReceiver';
import { YamahaReceiverButton } from './YamahaReceiverButton';

export interface YamahaReceiverClient {
  changeInput(input: YamahaReceiverInput): Promise<void>;

  on(): Promise<void>;

  off(): Promise<void>;

  buttonPress(button: YamahaReceiverButton): Promise<void>;
}
