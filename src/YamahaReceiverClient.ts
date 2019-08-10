import { YamahaReceiverButton } from './YamahaReceiverButton';
import { YamahaReceiverInput, YamahaReceiverStatus, YamahaReceiverZone } from './YamahaReceiverStatus';

export interface YamahaReceiverClient {
  changeInput(input: YamahaReceiverInput): Promise<void>;

  on(): Promise<void>;

  off(): Promise<void>;

  powerToggle(): Promise<void>;

  buttonPress(button: YamahaReceiverButton): Promise<void>;

  getStatus(zone: YamahaReceiverZone): Promise<YamahaReceiverStatus>;
}
