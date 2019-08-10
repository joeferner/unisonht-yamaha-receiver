import {
  NextFunction,
  RouteHandlerRequest,
  RouteHandlerResponse,
  StandardKey,
  SupportedKeys,
  UnisonHT,
  UnisonHTDevice,
} from '@unisonht/unisonht';
import { YamahaReceiverClient } from './YamahaReceiverClient';
import { YamahaReceiverClientMock } from './YamahaReceiverClientMock';
import { YamahaReceiverClientImpl } from './YamahaReceiverClientImpl';
import { YamahaReceiverButton } from './YamahaReceiverButton';

export interface YamahaReceiverOptions {
  useMockClient?: boolean;
  address: string;
}

export interface YamahaReceiverStatus {
  [key: string]: any; // TODO fill in
}

export enum YamahaReceiverZone {
  MAIN = 'Main_Zone',
}

export enum YamahaReceiverInput {
  HDMI1 = 'HDMI1',
  HDMI2 = 'HDMI2',
  HDMI3 = 'HDMI3',
  HDMI4 = 'HDMI4',
  HDMI5 = 'HDMI5',
  AV1 = 'AV1',
}

export class YamahaReceiver implements UnisonHTDevice {
  private readonly deviceName: string;
  private readonly client: YamahaReceiverClient;

  constructor(deviceName: string, options: YamahaReceiverOptions) {
    this.deviceName = deviceName;
    this.client = options.useMockClient
      ? new YamahaReceiverClientMock()
      : new YamahaReceiverClientImpl(options.address);
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public getSupportedKeys(): SupportedKeys {
    return {
      [StandardKey.MUTE]: {
        name: 'Mute',
        handleKeyPress: this.createKeyPressHandler(YamahaReceiverButton.MUTE),
      },
      [StandardKey.VOLUME_UP]: {
        name: 'Volume Up',
        handleKeyPress: this.createKeyPressHandler(YamahaReceiverButton.VOLUME_UP),
      },
      [StandardKey.VOLUME_DOWN]: {
        name: 'Volume Down',
        handleKeyPress: this.createKeyPressHandler(YamahaReceiverButton.VOLUME_DOWN),
      },
    };
  }

  private createKeyPressHandler(button: YamahaReceiverButton) {
    return async (
      key: string,
      request: RouteHandlerRequest,
      response: RouteHandlerResponse,
      next: NextFunction,
    ): Promise<void> => {
      await this.client.buttonPress(button);
    };
  }

  public async getStatus(): Promise<YamahaReceiverStatus> {
    return {};
  }

  public async initialize(unisonht: UnisonHT): Promise<void> {
    unisonht.post(this, 'on', {
      handler: this.handleOn.bind(this),
    });
    unisonht.post(this, 'off', {
      handler: this.handleOff.bind(this),
    });
    unisonht.post(this, 'input/:input', {
      handler: this.handleChangeInput.bind(this),
    });
  }

  private async handleChangeInput(
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    const input = request.parameters.input;
    await this.client.changeInput(input);
  }

  private async handleOn(
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    await this.client.on();
  }

  private async handleOff(
    request: RouteHandlerRequest,
    response: RouteHandlerResponse,
    next: NextFunction,
  ): Promise<void> {
    await this.client.off();
  }
}
